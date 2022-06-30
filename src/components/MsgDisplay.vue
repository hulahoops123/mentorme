<template>
  <!-- <p>gotMessages: {{ gotMessages }}</p> -->

  <ul v-for="item of messages">
    <p style="color: blue" v-if="item.sender === palName">
      {{ item.msgText }}
    </p>
    <p style="color: red" v-if="item.sender === myUserName">
      {{ item.msgText }}
    </p>
  </ul>
</template>
<script setup lang="ts">
import { computed, inject, ref, watch } from "vue";
import { getMessagesfromMessagesCollection } from "../firestore";

const gstate: any = inject("global");
const myUserName: string = gstate.global.loggedInUserProfile.userName;
const palName: string = gstate.global.globalPpSpotlight.palname;
const palStatus: any = computed(() => gstate.global.globalPpSpotlight.status);
const palPairId: any = computed(() => gstate.global.globalPpSpotlight.pairID);

const messages = ref([]);

// getMessages();
// defineExpose({ getMessages }); //so msgcompose can trigger after send

const props = defineProps(["updateMessages"]);
const emits = defineEmits(["update:updateMessages"]);

//so msgdisplay refreshes after send in msgcompose
watch(
  () => props.updateMessages,
  () => {
    if (props.updateMessages) {
      getMessages();
      emits("update:updateMessages", false);
    }
  }
);
getMessages(); //to fetch messages on first load

async function getMessages() {
  const result = await getMessagesfromMessagesCollection(palPairId.value).catch((err) =>
    console.log(err)
  );
  if (result) {
    const length = result.msgsArr.length;
    messages.value = result.msgsArr.map((singlemsg: any, index: number) => {
      const isLastMessage = index === length - 1;
      const isComingBack =
        palStatus.value === "transit" && singlemsg.sender != myUserName;
      if (isLastMessage && isComingBack) {
        return {
          timeSent: singlemsg.timeSent,
          sender: singlemsg.sender,
          msgText: "A pigeon is on the way to you",
        };
      } else {
        return singlemsg;
      }
    });
  }
}
</script>
