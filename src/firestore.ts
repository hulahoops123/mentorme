import { functionTypeAnnotation } from "@babel/types";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { onUnmounted, ref } from "vue";
import { firestore } from "./firebaseInit";

const userProfilesCollection = collection(firestore, "userProfiles"); //v9
const messagesCollection = collection(firestore, "messages2");

export const getUserProfileFirestore = async (id: string) => {
  const searchForThisUser = doc(userProfilesCollection, id);
  const userProfileQuery = await getDoc(searchForThisUser); //v9
  return userProfileQuery.exists() ? userProfileQuery.data() : null;
};

export const checkIfUserNameUnique = async (userName: string) => {
  const searchForThisUserName = query(
    userProfilesCollection,
    where("userName", "==", userName)
  );
  const matchingUserNames = await getDocs(searchForThisUserName);
  return matchingUserNames.size > 0 ? true : false;
};

export const addUserToUserProfilesCollection = (userProfile: any) => {
    return setDoc(doc(userProfilesCollection, userProfile.uid), {
      userName: userProfile.userName,
      photoURL: userProfile.photoURL,
      displayName: userProfile.displayName,
    });
};

export const addPidgpalToUserContacts = async (id: string, pidgpal: string) => {
  const userRef = doc(userProfilesCollection, id);
  return await updateDoc(userRef, {
    ppContacts: arrayUnion(pidgpal), 
  });
};

export const addPidgpalToBlockedContacts = async (
  id: string,
  pidgpal: string
) => {
  const userRef = doc(userProfilesCollection, id);
  return await updateDoc(userRef, {
    ppContacts: arrayRemove(pidgpal),
    ppBlocked: arrayUnion(pidgpal), 
  });
};

export async function removeFromBlockedContacts(userId:string, blockedName:string){
  const userRef = doc(userProfilesCollection, userId);
  return await updateDoc(userRef,{
    ppBlocked:arrayRemove(blockedName),
    ppContacts:arrayUnion(blockedName),
  });
};

export function useMessageListener(username: string) {
  const foundPidgins = ref<any[]>([]);
  const findPidginsWithUsername = query(
    messagesCollection,
    where("members", "array-contains", username)
  );
  const detachMsgListener = onSnapshot(findPidginsWithUsername, (foundDocs) => {
    let found: any = [];
    foundDocs.forEach((doc) => {
      found.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    foundPidgins.value = found;
  });
  onUnmounted(detachMsgListener);
  return { foundPidgins };
}

export async function getUserProfilePic(userName: string) {
  const searchForThisUserName = query(
    userProfilesCollection,
    where("userName", "==", userName)
  );
  const matchingUserNames = await getDocs(searchForThisUserName);
  const thePic = matchingUserNames.docs.map((doc) => {
    return { pic: doc.data().photoURL };
  });
  return matchingUserNames.size > 0 ? thePic[0].pic : "noPic";
}

export async function newMessagetoExistingMessagesArray(
  msg: object,
  messagesId: string
): Promise<void> {
  const messagesReference = doc(messagesCollection, messagesId);
  return await updateDoc(messagesReference, {
    messages: arrayUnion({
      msgText: msg.msgText,
      from: msg.from,
      timeSent: Timestamp.now(),
      to: msg.to,
    }),
  });
}

export async function newMessagetoNewMessagesArray(msg: object) {
  const messagesReference = await addDoc(messagesCollection, {
    members: [msg.to, msg.from],
    messages: [
      {
        msgText: msg.msgText,
        from: msg.from,
        timeSent: Timestamp.now(),
        to: msg.to,
      },
    ],
  });
  return messagesReference.id;
}
