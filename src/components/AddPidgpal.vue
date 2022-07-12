<template>
  <p>Add Pidgpal component</p>
  <button @click="$emit('exitAddContactComponent')">Close</button>
  <input
    :disabled="checkStarted"
    type="text"
    placeholder="enter pidgpal username"
    v-model="inputUserName"
    title="Enter pidgpal username"
  />
  <button @click="checkInputUsername" v-if="!checkStarted">Add Pidgpal</button>
  <p v-if="!userNameExists && checkStarted">
    The username {{ inputUserName }} does not exist
  </p>
  <button v-if="!userNameExists && checkStarted" @click="checkStarted = false">
    Try Again
  </button>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { checkIfUserNameUnique } from "../firestore";

const emits = defineEmits<{
  (e: "chosenUsername", userName: string): void;
  (f: "exitAddContactComponent"): void;
}>();
const pattern = /^([a-zA-Z0-9_.]){5,30}$/; //regex pattern
const inputUserName = ref("");
const userNameExists = ref(false);
const checkStarted = ref(false);

const checkInputUsername = async () => {
  checkStarted.value = true;
  if (pattern.test(inputUserName.value)) {
    await checkIfUserNameUnique(inputUserName.value.toLowerCase()).then((result) => {
      if (result) {
        userNameExists.value = true;
        emits("chosenUsername", inputUserName.value);
      } else {
        userNameExists.value = false;
      }
    });
  } else {
    //if they fail the pattern
    userNameExists.value = false;
  }
};
</script>
