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
  removeFromBlockedContacts,
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
    alert("This contact already exists");
  } else if (tempBlockedContacts.includes(userName)) {
    alert("This contact is blocked. Click on blocked contacts to restore them");
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

const showBlocked = ref(false);

async function moveFromBlockedToFriends(blockedName: string) {
  await removeFromBlockedContacts(userId, blockedName).catch((err) => console.log(err));
  updateGlobalStateUserProfile();
}

function resetAddPidgpalComponentVariables() {
  isAddPidgpal.value = false;
  showBlocked.value = false;
}
</script>

<template>
  <div class="flex flex-col">
    <div name="pic-name-exit" class="mt-4 mx-0.5 flex items-center">
      <UserInfoVue :pic="userPictureUrl" :display-name="displayName"></UserInfoVue>
      <button class="" @click="logOut">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-8 w-8 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      </button>
    </div>
    <div name="add-friend-button" v-if="!isAddPidgpal" class="text-left pl-4 pt-4">
      <button @click="isAddPidgpal = true">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          />
        </svg>
      </button>
    </div>
    <div
      name="add-friends-popup"
      class="pt-0.5 mx-3 px-1 border border-dark-50 rounded-lg bg-purple-100 bg-transparent drop-shadow"
      v-if="isAddPidgpal"
    >
      <div
        name="show-blocked-button"
        class="flex pl-2 flex-row-reverse"
        v-if="!showBlocked"
        @click="showBlocked = true"
      >
        <button
          name="show-blocked-button"
          class="flex pl-2 flex-row-reverse"
          v-if="!showBlocked"
          @click="showBlocked = true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="mr-2 h-5 w-6 stroke-orange-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6"
            />
          </svg>
        </button>
      </div>
      <AddPidgpalVue
        @chosen-username="addUserToUserContacts"
        @exit-add-contact-component="resetAddPidgpalComponentVariables()"
      ></AddPidgpalVue>

      <div class="flex flex-col items-center py-4" v-if="showBlocked">
        <div name="unshow-blocked-button" class="flex items-center">
          <a class="text-orange-800 text-sm text-shadow-lg"> tap to unblock </a>
          <button @click="showBlocked = false">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z"
              />
            </svg>
          </button>
        </div>

        <ul v-for="aBlockedContact in blockedContacts" class="self-stretch pl-9">
          <li class="text-sm" @click="moveFromBlockedToFriends(aBlockedContact)">
            <div class="flex">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 mt-1.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6"
                />
              </svg>
              <p class="pl-1 py-1 items-center">
                {{ aBlockedContact }}
              </p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <div class="grid-container">
    <PidgpalCardVue
      class="grid-item"
      v-for="contact in calculatedContactsArray"
      :friend="contact.palName"
      :status="contact.palStatus"
      :pic="contact.palPic"
      :key="contact.palName"
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
