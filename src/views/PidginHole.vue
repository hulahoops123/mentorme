<script setup lang="ts">
import { onAuthStateChanged, signOut } from "firebase/auth";
import { computed, inject, onBeforeUnmount, ref, watch } from "vue";
import { useRouter } from "vue-router";
import AddPidgpalVue from "../components/AddPidgpal.vue";
import PidgpalCardVue from "../components/PidgpalCard.vue";
import UserInfoVue from "../components/UserInfo.vue";
import { auth } from "../firebaseInit";
import {
  addPidgpalToUserContacts,
  getUserProfileFirestore,
  getUserProfilePic,
  useMessageListener,
} from "../firestore";

const gstate: any = inject("global");
const router = useRouter();
const isAddPidgpal = ref(false);
const globalUserProfile = gstate.global.loggedInUserProfile;
const userId = globalUserProfile.uid;
const userPictureUrl = globalUserProfile.photoURL;
const userName: string = globalUserProfile.userName;
const displayName = globalUserProfile.displayName
  ? globalUserProfile.displayName
  : globalUserProfile.userName;
const userContacts = computed(() => globalUserProfile.ppContacts);
const blockedContacts = computed(() => globalUserProfile.ppBlocked);

const cleanupHandleASC = onAuthStateChanged(auth, handleAuthStateChange);
onBeforeUnmount(cleanupHandleASC);

const { foundPidgins } = useMessageListener(userName);

const triggerRefresh = ref(false);
const calculatedContactsArray = ref();
watch(
  () => [foundPidgins.value, triggerRefresh.value],
  async () => {
    let tempArray: any = [];
    let friendsAlreadyStarted: any = {};
    for (const pidgin of foundPidgins.value) {
      const friendsName = getFriendNameFromMembersArray(pidgin.members);
      friendsAlreadyStarted[friendsName] = pidgin;
      addNewMessageSendersToContacts(friendsName);
    }
    for (const contact of userContacts.value) {
      if (!friendsAlreadyStarted[contact]) {
        const ret = await prepareNOTStartedContactForStatusGrid(contact);
        tempArray.push(ret);
      } else {
        const pidgin = friendsAlreadyStarted[contact];
        const ret = await prepareStartedContactForStatusGrid(pidgin);
        tempArray.push(ret);
      }
    }
    calculatedContactsArray.value = tempArray;
  }
);

async function prepareNOTStartedContactForStatusGrid(friendsName: string) {
  const friendsPicUrl = await getUserProfilePic(friendsName);
  const friendStatus = "notStarted";
  const friendsMessages: never[] = [];
  const messagesId = "notStarted";
  return {
    palName: friendsName,
    palPic: friendsPicUrl,
    palStatus: friendStatus,
    palMessages: friendsMessages,
    messagesId: messagesId,
  };
}

async function prepareStartedContactForStatusGrid(pidgin: any) {
  const friendsName = getFriendNameFromMembersArray(pidgin.members);
  const friendsPicUrl = await getUserProfilePic(friendsName);
  const friendStatus = calculateStatus(pidgin.messages, friendsName);
  const friendsMessages = pidgin.messages ? pidgin.messages : [];
  const messagesId = pidgin.id;
  return {
    palName: friendsName,
    palPic: friendsPicUrl,
    palStatus: friendStatus,
    palMessages: friendsMessages,
    messagesId: messagesId,
  };
}

function addNewMessageSendersToContacts(friendsName: string) {
  if (!blockedContacts.value.includes(friendsName)) {
    if (!userContacts.value.includes(friendsName)) {
      addPidgpalToUserContacts(userId, friendsName).catch((e) => {
        console.log(e);
      });
      updateGlobalStateUserProfile();
    }
  }
}

function getFriendNameFromMembersArray(members: string[]) {
  if (members[0] != userName) return members[0];
  return members[1];
}

function calculateStatus(messagesArray: [], friendsName: string) {
  if (!messagesArray) return "notStarted"; //also not possible except for testing
  const lastMessagePosition = messagesArray.length - 1;
  const lastMessage: any = messagesArray[lastMessagePosition];
  const lastMessageSender = lastMessage.from;
  const lastMessageTimeSent = lastMessage.timeSent.seconds * 1000;
  const timeNow = new Date().getTime();
  let status: string;
  if (timeNow - lastMessageTimeSent > flightTime()) {
    status = lastMessageSender != friendsName ? "away" : "home";
  } else {
    status = "transit";
  }
  return status;
}

const flightTime: any = () => {
  //calculate flighttime of 3 days to milliseconds
  const day1 = new Date(2000, 0, 1).getTime();
  const day2 = new Date(2000, 0, 4).getTime();
  const ft = day2 - day1;
  return ft;
};

async function updateGlobalStateUserProfile() {
  //get the latest user profile from firebase
  const userProfileData = await getUserProfileFirestore(userId).catch((e) =>
    console.log(e)
  );
  //update the global variable
  gstate.global.updateUsrGlobalState({ uid: userId, ...userProfileData });
  triggerRefresh.value = !triggerRefresh.value;
}

const goToSpotlight = (
  pal: string,
  pic: string,
  status: string,
  messagesArray: [],
  messagesId: string
) => {
  gstate.global.updateGlobalPpSpotlight({
    palpic: pic,
    status: status,
    palname: pal,
    palMessages: messagesArray,
    messagesId: messagesId,
  });
  router.push("pidgpal-spotlight");
};

const addUserToUserContacts = async (userName: string) => {
  isAddPidgpal.value = false;
  const tempUsrContacts = userContacts.value;
  const tempBlockedContacts = blockedContacts.value;
  if (tempUsrContacts.includes(userName)) {
    alert("This contact exists");
  } else if (tempBlockedContacts.includes(userName)) {
    alert("This contact is blocked");
  } else {
    await addPidgpalToUserContacts(userId, userName.toLowerCase()).catch((e) => {
      console.log(e);
    });
    updateGlobalStateUserProfile();
  }
};

function handleAuthStateChange(user: any): void {
  if (!user) {
    router.push("/"); //home is sign-in page
  }
}

const logOut = () => {
  signOut(auth).catch((err) => {
    console.error(err);
  });
};
</script>

<template>
  <UserInfoVue :pic="userPictureUrl" :display-name="displayName"></UserInfoVue>
  <button class="btn btn-success" @click="logOut">Logout</button>

  <button v-if="!isAddPidgpal" @click="isAddPidgpal = true">Add Pidgpal</button>

  <AddPidgpalVue
    v-if="isAddPidgpal"
    @pidgpalchosen="addUserToUserContacts"
    @shutitdown="isAddPidgpal = false"
  ></AddPidgpalVue>

  <div class="grid-container">
    <PidgpalCardVue
      class="grid-item"
      v-for="contact in calculatedContactsArray"
      v-bind:friend="contact.palName"
      :status="contact.palStatus"
      :pic="contact.palPic"
      v-bind:key="contact.palName"
      @go-to-spotlight="
        goToSpotlight(
          contact.palName,
          contact.palPic,
          contact.palStatus,
          contact.palMessages,
          contact.messagesId
        )
      "
    ></PidgpalCardVue>
  </div>
</template>

<style>
.grid-container {
  display: grid;
  grid-template-columns: auto auto auto;
}

.grid-item {
  border: 1px solid rgba(0, 0, 0, 0.8);
  text-align: center;
}
</style>
