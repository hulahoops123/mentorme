<template>
  <button v-if="!isNewUser" @click="googleSignIn">googleIn</button>
  <div v-if="isNewUser">
    <UsernameComponent
      msg="enter your username"
      @addthisuser="registerNewUser"
    ></UsernameComponent>
  </div>
</template>

<script setup lang="ts">
import { auth } from "../firebaseInit";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getUserProfileFirestore, addUserToUserProfilesCollection } from "../firestore";
import { useRouter } from "vue-router";
import { inject, ref } from "vue";
import UsernameComponent from "../components/UsernameCheck.vue";

const router = useRouter();
const googleProvider = new GoogleAuthProvider();
const userId = ref("");
const photoURL = ref("");
const isNewUser = ref(false);
const globalState = inject("global");

const googleSignIn = () => {
  signInWithPopup(auth, googleProvider)
    .then((user) => {
      userId.value = user.user.uid;
      user.user.photoURL
        ? (photoURL.value = user.user.photoURL)
        : (photoURL.value = "no pic");
      checkIfUserInUsersCollection();
    })
    .catch((error) => {
      console.error(error);
    });
};

const checkIfUserInUsersCollection = () => {
  getUserProfileFirestore(userId.value).then((userProfileData) => {
    if (userProfileData != null) {
      globalState.global.updateUsrGlobalState({ uid: userId.value, ...userProfileData });
      router.push("pidgin-hole");
    } else {
      isNewUser.value = true;
    }
  });
};

const registerNewUser = async (username: any) => {
  await addUserToUserProfilesCollection({
    displayName: username,
    userName: username.toLowerCase(),
    uid: userId.value,
    photoURL: photoURL.value,
  });
  router.push("pidgin-hole");
};
</script>
