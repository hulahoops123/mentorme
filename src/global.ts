import { Timestamp } from "@firebase/firestore";
import { reactive, readonly, ref } from "vue";

//userprofile
const loggedInUserProfile = reactive({
  uid:"",
  userName: "example",
  displayName: "",
  photoURL: "",
  ppContacts: [],
  ppBlocked: [],
});
const updateUsrGlobalState = function (data) {
  loggedInUserProfile.uid = data.uid;
  loggedInUserProfile.userName = data.userName;
  loggedInUserProfile.displayName = data.displayName ? data.displayName : "";
  loggedInUserProfile.photoURL = data.photoURL ? data.photoURL : "";
  loggedInUserProfile.ppContacts = data.ppContacts ? data.ppContacts : [];
  loggedInUserProfile.ppBlocked = data.ppBlocked ? data.ppBlocked : [];
};

//spotlight global
const globalPpSpotlight = reactive({
  palpic:"",
  status: "",
  palname: "",
  palMessages:[],
});

const updateGlobalPpSpotlight = function (newData) {
  globalPpSpotlight.status = newData.status;
  globalPpSpotlight.palpic = newData.palpic;
  globalPpSpotlight.palname = newData.palname;
  globalPpSpotlight.palMessages = newData.palMessages;
  globalPpSpotlight.messagesId = newData.messagesId;
};

//messagesCollection
interface IndividualMessage{
  from:string;
  msgText:string;
  timeSent:string;
}

interface MessagesCollection{
  members:string[];
  lastMsgTimeSent:Timestamp;
  messages:IndividualMessage[];
}

const entireMessageCollection = ref<MessagesCollection[]>([]);
const updateMessageCollection = function (data) {
  console.log("global fired");
  
  entireMessageCollection.value = data.map((doc) => {
    return { ...doc };
  });
};

export default {
  loggedInUserProfile: readonly(loggedInUserProfile),
  updateUsrGlobalState,
  globalPpSpotlight:readonly(globalPpSpotlight),
  updateGlobalPpSpotlight,
  entireMessageCollection:readonly(entireMessageCollection),
  updateMessageCollection,
};


