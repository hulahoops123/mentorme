<template>
  <p>Add Pidgpal component</p>
  <button @click="$emit('exitAddContactComponent')">Close</button>

  <div id="before-started" v-if="!checkStarted">
    <input
      type="text"
      placeholder="enter pidgpal username"
      v-model="inputUserName"
      title="Enter pidgpal username"
    />
    <button @click="verifyAndAddInputName">Add this Pidgpal</button>
  </div>

  <div id="after-started" v-if="checkStarted">
    <div v-if="userNameDoesNotExist">
      <button @click="resetStartingVariables()">Try Again</button>
      <p>The o {{ inputUserName }} does not exist</p>
    </div>
  </div>
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
const userNameDoesNotExist = ref();
const checkStarted = ref(false);

function resetStartingVariables() {
  checkStarted.value = false;
  userNameDoesNotExist.value = "";
}

async function verifyAndAddInputName() {
  checkStarted.value = true;
  if (!pattern.test(inputUserName.value)) return (userNameDoesNotExist.value = true);
  checkIfUserNameUnique(inputUserName.value.toLowerCase()).then((res) => {
    userNameDoesNotExist.value = !res;
    !userNameDoesNotExist.value && emits("chosenUsername", inputUserName.value);
  });
}
</script>
