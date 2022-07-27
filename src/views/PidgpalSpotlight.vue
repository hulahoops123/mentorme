<template>
  <button @click="router.back()">◀️ back</button>
  <UserInfoVue :pic="friendPictureUrl" :display-name="friendName"></UserInfoVue>
  <button class="btn btn-success" @click="blockUser(friendName)">Block</button>
  <br />
  <br />
  <br />
  <MessageComposeVue></MessageComposeVue>
  <MessageDisplay></MessageDisplay>
</template>

<script setup lang="ts">
import { inject, ref } from "vue";
import { useRouter } from "vue-router";
import UserInfoVue from "../components/UserInfo.vue";
import { addPidgpalToBlockedContacts, getUserProfileFirestore } from "../firestore";
import MessageComposeVue from "../components/MessageCompose.vue";
import MessageDisplay from "../components/MessageDisplay.vue";
const router = useRouter();
const globalState: any = inject("global");

const globalUserProfile = globalState.global.loggedInUserProfile;
const userId = globalUserProfile.uid;
const userName: string = globalUserProfile.userName;

const friendName: string = globalState.global.globalPpSpotlight.palname;
const friendPictureUrl: string = globalState.global.globalPpSpotlight.palpic;

async function blockUser(blockThisPal: string) {
  // alert(`Are you sure you want to block ${blockThisPal}?`);
  await addPidgpalToBlockedContacts(userId, blockThisPal).catch((e) => {
    console.log(e);
  });
  updateGlobalStateUserProfile();
  router.back();
}

async function updateGlobalStateUserProfile() {
  //get the latest user profile from firebase
  const userProfileData = await getUserProfileFirestore(userId).catch((e) =>
    console.log(e)
  );
  //update the global variable
  globalState.global.updateUsrGlobalState({ uid: userId, ...userProfileData });
}
</script>
