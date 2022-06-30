<script setup lang="ts">
import { async } from "@firebase/util";
import { log } from "console";
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
  getLastMessageStatusfromMessagesCollection,
  usePidgPalListener,
  getUserProfilePic,
  getMessagesfromMessagesCollection2,
  returnFoundMessages,
} from "../firestore";

const showWorkings = ref(true);
function toggleWorkings() {
  showWorkings.value = !showWorkings.value;
}

const gstate: any = inject("global");
const router = useRouter();
const isAddPidgpal = ref(false);
const uid = gstate.global.loggedInUserProfile.uid;
const pic = gstate.global.loggedInUserProfile.photoURL;
const uname: string = gstate.global.loggedInUserProfile.userName;
const dname = gstate.global.loggedInUserProfile.displayName
  ? gstate.global.loggedInUserProfile.displayName
  : gstate.global.loggedInUserProfile.userName;
const userContacts = computed(() => gstate.global.loggedInUserProfile.ppContacts);
const blockedContacts = computed(() => gstate.global.loggedInUserProfile.ppBlocked);
const statusGrid = computed(() => gstate.global.statusGrid.value);

const cleanupHandleASC = onAuthStateChanged(auth, handleAuthStateChange);
onBeforeUnmount(cleanupHandleASC);

const { foundPairs: pidgPals } = usePidgPalListener(uname);

const foundMessages = getMessagesfromMessagesCollection2(uname);

let found: any = [];

foundMessages.then((result) => {
  found.push(result.found);
  console.log(result.found);
});

// const foundFromFound = computed(() => {
//   return foundMessages;
// });
// // foundMessages.forEach((doc) => {
// //   found.push(doc.data());
// // });

//get the pals name from pidgpals/foundpairs
const palFromPairs = computed(() =>
  pidgPals.value.map((doc) => {
    return {
      id: doc.id,
      pal: doc.pal1 != uname ? doc.pal1 : doc.pal2,
    };
  })
);

const messagePairIdPerContact2 = ref<any[]>([]);
messagePairIdPerContact2.value = getPalFromPairs();
function getPalFromPairs() {
  watch(
    () => gstate.global.loggedInUserProfile.ppContacts,
    () => {
      gstate.global.loggedInUserProfile.ppContacts.map((contact: string) => {
        if (palFromPairs.value.find((pair) => pair.pal === contact)) {
          return palFromPairs.value.find((pair) => pair.pal === contact);
        } else {
          return {
            id: "notStarted",
            pal: contact,
          };
        }
      });
    }
  );
}

//check if a palpair (and therefore  msgid) exists for each contact
const messagePairIdPerContact = computed(() =>
  userContacts.value.map((contact: string) => {
    if (palFromPairs.value.find((pair) => pair.pal === contact)) {
      return palFromPairs.value.find((pair) => pair.pal === contact);
    } else {
      return {
        id: "notStarted",
        pal: contact,
      };
    }
  })
);

//for each contact get a picture and get the last message from msgcollection
//calculate flight status for each last message
const contactGrid: any[] = computed(async () => {
  const cttGrid = [];
  for (const pair of messagePairIdPerContact.value) {
    const gotPic = await getUserProfilePic(pair.pal);

    if (pair.id != "notStarted") {
      const gotStatus = await getLastMessageStatusfromMessagesCollection(
        pair.id,
        pair.pal,
        gstate.global.loggedInUserProfile.userName
      ).catch((e) => console.log(e));
      cttGrid.push({
        pal: pair.pal,
        status: gotStatus.status,
        pic: gotPic,
        pairID: pair.id,
      });
    } else {
      cttGrid.push({
        pal: pair.pal,
        status: "notStarted",
        pic: gotPic,
        pairID: pair.id,
      });
    }
  }
  gstate.global.updateStatusGrid(cttGrid);
});

// async function calculateStatusGrid() {
//   const cttGrid = [];
//   for (const pair of msgPairIdPerContact.value) {
//     const gotPic = await getUserProfilePic(pair.pal);

//     if (pair.id != "notStarted") {
//       const gotStatus = await getLastMsgStatusfromMsgsCollection(
//         pair.id,
//         pair.pal,
//         gstate.global.loggedInUserProfile.userName
//       ).catch((e) => console.log(e));
//       cttGrid.push({
//         pal: pair.pal,
//         status: gotStatus.status,
//         pic: gotPic,
//         pairID: pair.id,
//       });
//     } else {
//       cttGrid.push({
//         pal: pair.pal,
//         status: "notStarted",
//         pic: gotPic,
//         pairID: pair.id,
//       });
//     }
//   }
//   gstate.global.updateStatusGrid(cttGrid);
// }

// calculateStatusGrid();

//watch the pairs collection. add any new pairs to my contacts
//a new pair means that a new message from a new sender has been sent to me
function addPalfromPairsToUserContacts() {
  watch(
    () => palFromPairs.value,
    () => {
      palFromPairs.value.map((doc) => {
        if (!blockedContacts.value.includes(doc.pal)) {
          if (!userContacts.value.includes(doc.pal)) {
            console.log(`The user ${doc.pal} is Not in your contacts and will be added`);
            addPidgpalToUserContacts(uid, doc.pal).catch((e) => {
              console.log(e);
            });
            updateGstateUserProfile();
          }
        }
      });
    }
  );
}
addPalfromPairsToUserContacts();

async function updateGstateUserProfile() {
  //get the latest user profile from firebase
  const userProfileData = await getUserProfileFirestore(uid).catch((e) => console.log(e));
  //update the global variable
  gstate.global.updateUsrGlobalState({ uid: uid, ...userProfileData });
}

const goToSpotlight = (pal: string, pic: string, status: string, pairID: string) => {
  gstate.global.updateGlobalPpSpotlight({
    palpic: pic,
    status: status,
    pairID: pairID,
    palname: pal,
  });
  router.push("pidgpal-spotlight");
};

const addPidgpal = async (ppName: string) => {
  isAddPidgpal.value = false;
  const tempUsrContacts = userContacts.value;
  const tempBlockedContacts = blockedContacts.value;
  if (tempUsrContacts.includes(ppName)) {
    alert("This contact exists");
  } else if (tempBlockedContacts.includes(ppName)) {
    alert("This contact is blocked");
  } else {
    await addPidgpalToUserContacts(uid, ppName.toLowerCase()).catch((e) => {
      console.log(e);
    });
    //update the global data with the new data from the user profile including updated array
    updateGstateUserProfile();
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
  <UserInfoVue :pic="pic" :display-name="dname"></UserInfoVue>
  <button class="btn btn-success" @click="logOut">Logout</button>

  <button v-if="!isAddPidgpal" @click="isAddPidgpal = true">Add Pidgpal</button>

  <AddPidgpalVue
    v-if="isAddPidgpal"
    @pidgpalchosen="addPidgpal"
    @shutitdown="isAddPidgpal = false"
  ></AddPidgpalVue>

  <ul v-for="item in found">
    <li>{{ item }}</li>
  </ul>

  <!-- <button @click="toggleWorkings">Toggle Inner</button> -->
  <!-- <div v-if="showWorkings"> -->
  <!-- <h3>global state : {{ gstate.global.loggedInUserProfile }}</h3>
    <h3>Pidpals : {{ pidgPals }}</h3>
    <h4>palFromPairs : {{ palFromPairs }}</h4>
    <h4>msgPairIdPerContact : {{ msgPairIdPerContact }}</h4> -->
  <h3>contactGrid : {{ contactGrid }}</h3>
  <!-- <p>found: {{ foundFromFound }}</p> -->
  <!-- <h6 style="color: crimson">Status Grid :{{ statusGrid }}</h6> -->
  <!-- <h1>{{ found }}</h1> -->
  <!-- </div> -->

  <div class="grid-container">
    <PidgpalCardVue
      class="grid-item"
      v-for="individualPal in statusGrid"
      v-bind:friend="individualPal.pal"
      :status="individualPal.status"
      :pic="individualPal.pic"
      v-bind:key="individualPal.pal"
      @go-to-spotlight="
        goToSpotlight(
          individualPal.pal,
          individualPal.pic,
          individualPal.status,
          individualPal.pairID
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
