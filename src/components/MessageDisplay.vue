<template>
  <ul v-for="message of filteredMessages">
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
const friendName: string = gstate.global.globalPpSpotlight.palname;
const friendCurrentStatus: any = computed(() => gstate.global.globalPpSpotlight.status);
const messages: [] = gstate.global.globalPpSpotlight.palMessages;
const numberOfMessages: number = messages.length;

const filteredMessages = computed(() =>
  gstate.global.globalPpSpotlight.palMessages.map((singlemsg: any, index: number) => {
    const isLastMessage = index + 1 === numberOfMessages ? true : false;
    const iAmNotTheSender = singlemsg.from === friendName ? true : false;
    const isInTransit = friendCurrentStatus.value === "transit" ? true : false;
    if (isInTransit && isLastMessage && iAmNotTheSender) {
      return {
        timeSent: singlemsg.timeSent,
        from: singlemsg.from,
        msgText: "Ssshhh....Its a secret",
        to: singlemsg.to,
      };
    } else {
      return singlemsg;
    }
  })
);
const allThisFriendsMessages = computed(() =>
  gstate.global.globalPpSpotlight.palMessages.map((singlemsg: any, index: number) => {
    // isLastMessage = index === length - 1 ? true : false;

    // isComingBack =
    //   friendCurrentStatus.value === "transit" && singlemsg.from != myUserName
    //     ? true
    //     : false;
    // if (isLastMessage && isComingBack) {
    //   return {
    //     timeSent: singlemsg.timeSent,
    //     from: singlemsg.from,
    //     msgText: "A pigeon is on the way to you",
    //     to: singlemsg.to,
    //   };
    // } else {
    //   return singlemsg;
    // }
    return singlemsg;
  })
);
</script>
