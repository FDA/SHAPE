import { GET_DIARY_ENTRIES } from "./types";
import { collections, environments } from "../../utils/Constants";
import { Diary } from "../../interfaces/DataTypes";
import { formatISO } from "date-fns";

export const submitDiary = (context: any) => {
  return (dispatch: Function, getStates: Function, getFirebase: Function) => {
    const fireBase = getFirebase();
    const fireStore = fireBase.firestore();
    const state = getStates();
    const participantId = state.firebase.profile.participantId;
    const org = state.firebase.profile.org;
    const docData = {
      participantId,
      org: org,
      dateWritten: formatISO(new Date()),
      ...context,
    };
    fireStore
      .collection(collections.PARTICIPANT_DIARY)
      .add(docData)
      .then(function () {
        if (process.env.NODE_ENV === environments.DEVELOPMENT)
          console.log("Document successfully written!");
      })
      .catch((err: any) => {
        console.error(`Unable to write diary info ${err}`);
      });
  };
};

export const getDiaryEntries = (participantId: string, org: string) => {
  return (dispatch: Function, getStates: Function, getFirebase: Function) => {
    const fireBase = getFirebase();
    const fireStore = fireBase.firestore();
    const data: Array<Diary> = [];
    fireStore
      .collection("participant-diary")
      .where("participantId", "==", participantId)
      .where("org", "==", org)
      .get()
      .then(function (querySnapshot: any) {
        querySnapshot.forEach(function (doc: any) {
          let diary = doc.data();
          data.push(diary);
        });
        dispatch({ type: GET_DIARY_ENTRIES, data });
      })
      .catch(function (error: any) {
        console.error("Error getting documents: ", error);
      });
  };
};
