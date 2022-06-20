<template>
  <!-- <p>gotMessages: {{ gotMessages }}</p> -->

  <ul v-for="item of gotMessages">
    <h4 style="color: blue" v-if="item.sender === palName">
      {{ item.msgText }}
    </h4>
    <h5 style="color: red" v-if="item.sender === myUserName">
      {{ item.msgText }}
    </h5>
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

const gotMessages = ref([]);

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
    gotMessages.value = result.msgsArr.map((singlemsg: any, index: number) => {
      // if transit and last msg sender not me dont display
      if (index == length - 1) {
        if (
          palStatus.value === "home" ||
          palStatus.value === "away" ||
          (palStatus.value === "transit" && singlemsg.sender === myUserName)
        ) {
          return singlemsg;
        } else {
          console.log("message in transit and not sent by me so do not show");
          return {
            timeSent: singlemsg.timeSent,
            sender: singlemsg.sender,
            msgText: "A pigeon is on the way to you",
          };
        }
      } else {
        return singlemsg;
      }
    });
  }
}
</script>
