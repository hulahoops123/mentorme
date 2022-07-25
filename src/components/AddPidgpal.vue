<template>
  <div class="flex flex-col">
    <button @click="$emit('exitAddContactComponent')">
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
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </button>
    <div id="before-started" v-if="!checkStarted" class="flex mx-2">
      <input
        type="text"
        class="mr-1 placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md pl-3 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
        placeholder="enter pidgin username"
        v-model="inputUserName"
        title="Enter pidgin username"
      />
      <button @click="verifyAndAddInputName">
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
    <div id="after-started" v-if="checkStarted">
      <div v-if="userNameDoesNotExist" class="">
        <div class="flex justify-center p-12" @click="resetStartingVariables()">
          <button class="" @click="resetStartingVariables()">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 fill-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentcolor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z"
              />
            </svg>
          </button>

          <p class="text-gray-700">retry</p>
        </div>
        <p class="text-sm py-0.5 text-red-700">
          <span class="font-bold">{{ inputUserName }}</span> does not exist!
        </p>
      </div>
    </div>
  </div>

  <!-- <div id="before-started" v-if="!checkStarted">
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
  </div> -->
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
