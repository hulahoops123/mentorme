<template>
  <input
    type="text"
    placeholder="send a a message"
    v-model="messageInput"
    title="Send a message"
  />
  <button @click="sendMessage">Send Message</button>
  <h6>Your current status is : {{ friendCurrentStatus }}</h6>

  <!-- This is what I am currently working on. Trying to incorporate attachments -->
  <!-- <div style="border-color: red; border-style: solid">
    <input type="file" name="test" id="test" />
    <label for="test">Test</label>
  </div> -->
</template>
<script setup lang="ts">
import { computed, inject, ref } from "vue";
import {
  newMessagetoExistingMessagesArray,
  newMessagetoNewMessagesArray,
} from "../firestore";

const gstate: any = inject("global");
const myUsrName: string = gstate.global.loggedInUserProfile.userName;

//globalPpSpotlight is for the userContact that was clicked
const globalStateFriendDetails = gstate.global.globalPpSpotlight;
const friendName: string = globalStateFriendDetails.palname;
const friendPicture: string = globalStateFriendDetails.palpic;
const friendCurrentStatus: any = computed(() => globalStateFriendDetails.status);
const messagesCollectionId: any = computed(() => globalStateFriendDetails.messagesId);
const allThisFriendsMessages: [] = globalStateFriendDetails.palMessages;

const messageInput = ref("");

//if a msg has never been sent then create a pairid id the pidgpals collection
async function sendMessage() {
  const notStarted = friendCurrentStatus.value === "notStarted";
  const home = friendCurrentStatus.value === "home";
  const timeNow = new Date().getTime();

  if (notStarted) {
    //
    const newRefId = await addNewMessageToNewMessagesArray({
      msgText: messageInput.value,
      from: myUsrName,
      to: friendName,
    });

    // //update to transit so new message cannot be sent
    //and push the first message to the globalState
    gstate.global.updateGlobalPpSpotlight({
      palpic: friendPicture,
      status: "transit",
      messagesId: newRefId,
      palname: friendName,
      palMessages: [
        {
          msgText: messageInput.value,
          from: myUsrName,
          to: friendName,
          timeSent: timeNow,
        },
      ],
    });
    messageInput.value = "";
  } else if (home) {
    //get pair id
    const existingMessagesId = messagesCollectionId.value;
    //save message
    await addMessageToExisitingArray(
      {
        msgText: messageInput.value,
        from: myUsrName,
        to: friendName,
      },
      existingMessagesId
    );
    gstate.global.updateGlobalPpSpotlight({
      palpic: friendPicture,
      status: "transit",
      messagesId: existingMessagesId,
      palname: friendName,
      palMessages: [
        ...allThisFriendsMessages,
        {
          msgText: messageInput.value,
          from: myUsrName,
          to: friendName,
          timeSent: timeNow,
        },
      ],
    });
    messageInput.value = "";
  } else {
    alert("You must wait until the pigeon is home");
  }
}

async function addNewMessageToNewMessagesArray(msg: object) {
  const result = await newMessagetoNewMessagesArray(msg).catch((e) => console.log(e));
  return result;
}

async function addMessageToExisitingArray(msg: object, messagesId: string) {
  const result = await newMessagetoExistingMessagesArray(msg, messagesId).catch((e) =>
    console.log(e)
  );
  return result;
}
</script>
