import { GET_DIARY_ENTRIES } from "./types";
import { collections, environments } from "../../utils/Constants";
import { Diary } from "../../interfaces/DataTypes";
import { formatISO } from "date-fns";
import {
   addDoc,
   collection,
   getDocs,
   getFirestore,
   query,
   QuerySnapshot,
   where,
} from "firebase/firestore";

export const submitDiary = (context: any) => {
  return (dispatch: Function, getStates: Function) => {
    const firestore = getFirestore();
    const state = getStates();
    const userId = state.firebase.auth.uid;
    const docData = {
      dateWritten: formatISO(new Date()),
      userId: userId,
      ...context,
    };
    const collectionRef = collection(firestore, collections.PARTICIPANT_DIARY);
    addDoc(collectionRef, docData)
      .then(() => {
        if (process.env.NODE_ENV === environments.DEVELOPMENT)
          console.log("Document successfully written!");
      })
      .catch((err: any) => {
        console.error(`Unable to write diary info ${err}`);
      });
  };
};

export const getDiaryEntries = () => {
  return (dispatch: Function, getStates: Function) => {
    const firestore = getFirestore();
    const diaries: Array<Diary> = [];
    const state = getStates();
    const userId = state.firebase.auth.uid;

    const q  = query(
       collection(firestore, collections.PARTICIPANT_DIARY),
       where("userId", "==", userId),
    )
    getDocs(q)
      .then((querySnapshot: QuerySnapshot) => {
        querySnapshot.forEach((document: any) => {
          const diary = document.data();
          diaries.push(diary);
        });
        dispatch({ type: GET_DIARY_ENTRIES, diaries });
      })
      .catch((error: any) => {
        console.error("Error getting private diary entries: ", error);
      });
  };
};
