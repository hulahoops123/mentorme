<template>
  <ul v-for="message of allThisFriendsMessages">
    <p style="color: blue" v-if="message.from === friendName">
      {{ message.msgText }}
    </p>
    <p style="color: red" v-if="message.from != friendName">
      {{ message.msgText }}
    </p>
  </ul>
</template>
<script setup lang="ts">
import { computed, inject } from "vue";

const gstate: any = inject("global");
const myUserName: string = gstate.global.loggedInUserProfile.userName;
const friendName: string = gstate.global.globalPpSpotlight.palname;
const friendCurrentStatus: any = computed(() => gstate.global.globalPpSpotlight.status);
const allThisFriendsMessages = computed(() =>
  gstate.global.globalPpSpotlight.palMessages.map((singlemsg: any, index: number) => {
    const isLastMessage = index === length - 1;
    const isComingBack =
      friendCurrentStatus.value === "transit" && singlemsg.from != myUserName;
    if (isLastMessage && isComingBack) {
      return {
        timeSent: singlemsg.timeSent,
        from: singlemsg.from,
        msgText: "A pigeon is on the way to you",
        to: singlemsg.to,
      };
    } else {
      return singlemsg;
    }
  })
);
</script>
