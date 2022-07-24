<template>
  <div>
    <p class="font-bold text-xl pt-8">Welcome🤗</p>
    <p class="font-bold text-md pb-4">
      Because you are new you get to choose a pidgin username..
    </p>
    <p class="font-extralight text-xs gray-700 italic pb-0.5">
      Remember, your username cannot be changed!
    </p>
    <div class="flex">
      <input
        @keyup="checkUnique"
        class="mr-1 placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md pl-3 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
        type="text"
        :placeholder="msg"
        v-model="newUserName"
        title="Letters, numbers, _ and . only. 5-30 characters"
        required
      />
      <div
        class="font-medium rounded-md flex text-green-700 hover:text-white border-2 border-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:border-green-500 dark:text-green-500 dark:hover:text-white dark:hover:bg-green-600 dark:focus:ring-green-800"
        v-if="!usernameExists && newUserName.length >= 5"
        @click="$emit('addthisuser', newUserName)"
      >
        <p class="text-3xl font-bold pl-2">g</p>
        <button class="pr-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-7 w-7 stroke-1 fill-current"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
      <div
        class="font-medium rounded-lg text-sm text-center flex text-red-400 border-2 border-red-700 focus:ring-4 focus:outline-none focus:ring-gray-300"
        v-else
        :disabled="true"
      >
        <p class="text-3xl font-bold pl-2">n</p>
        <button class="pr-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-7 w-7 stroke-1 fill-current"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>

    <p
      class="text-sm py-0.5 text-green-700"
      v-if="!usernameExists && newUserName.length >= 5"
    >
      <span class="font-bold">{{ newUserName }}</span> is available
    </p>
    <p
      class="text-sm py-0.5 text-red-700"
      v-if="usernameExists || (newUserName.length < 5 && newUserName.length > 0)"
    >
      <span class="font-bold">{{ newUserName }}</span> is not available
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { checkIfUserNameUnique } from "../firestore";

defineProps<{ msg: string }>(); //this is unnecersarry. just testing props
defineEmits<{ (e: "addthisuser", userName: string): void }>();

const newUserName = ref("");
const usernameExists = ref(false);
const pattern = /^([a-zA-Z0-9_.]){5,30}$/; //regex pattern

const checkUnique = async () => {
  //if statement to avoid calling the database for the first 4 characters
  if (pattern.test(newUserName.value)) {
    //tolowercase because all usernames saved in lower case. display name preserves case sensitivity
    await checkIfUserNameUnique(newUserName.value.toLowerCase()).then((result) => {
      usernameExists.value = result;
    });
  } else {
    // usernameExists.value = true;
  }
};
</script>
