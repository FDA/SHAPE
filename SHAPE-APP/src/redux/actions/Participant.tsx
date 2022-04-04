import {
  ACTIVE_PARTICIPANT,
  ADD_PARTICIPANT_NAMES,
  GET_DIARY_ENTRIES,
  IS_LOADING,
  PARTICIPANT_INBOX,
  PARTICIPANT_LOOKUP_FAILED,
  PARTICIPANT_LOOKUP_RESET,
  Q13_QUERY,
  Q13_RESET,
  SURVEY_INFORMED_CONSENT,
  SURVEY_QUERY,
  UPDATE_PARTICIPANT,
  APPLICATION_READY,
  GET_EHR_RECEIPTS,
  Q13_ANSWER_QUERY,
} from "./types";
import { isEmptyObject, registerForPush } from "../../utils/Utils";
import { batch } from "react-redux";
import { isPlatform } from "@ionic/react";
import { environments, collections } from "../../utils/Constants";
import {
  Survey,
  Questionnaire,
  Diary,
  InformedConsent,
  ParticipantResponse,
  Message,
  EHRReceipt,
  Person,
  User,
} from "../../interfaces/DataTypes";

export const refreshAll = (
  org: string,
  participantId: string,
  userId: string,
  pushEnabled: boolean = false
) => {
  return (dispatch: Function, getStates: Function, getFirebase: Function) => {
    dispatch({ type: IS_LOADING, isLoading: true });
    const fireBase = getFirebase();
    const fireStore = fireBase.firestore();

    let resetQuestionnaire = new Promise((resolve, reject) => {
      dispatch({ type: Q13_RESET });
      resolve();
    });

    let getSurveys = new Promise((resolve, reject) => {
      fireStore
        .collection(collections.SURVEY)
        .where("participants", "array-contains", participantId)
        .where("org", "==", org)
        .where("open", "==", true)
        .get()
        .then(function (querySnapshot: any) {
          const data: Array<Survey> = [];
          querySnapshot.forEach(function (doc: any) {
            let survey = doc.data();
            delete survey.participants;
            survey = { ...survey, id: doc.id };
            data.push(survey);
          });
          dispatch({ type: SURVEY_QUERY, data });
          resolve();
        })
        .catch(function (error: any) {
          console.error("Error getting documents: ", error);
          resolve();
        });
    });

    let getQuestionnaires = new Promise((resolve, reject) => {
      const q13Array: Array<Questionnaire> = [];
      fireStore
        .collection(collections.QUESTIONNAIRE)
        .where("participants", "array-contains", participantId)
        .where("org", "==", org)
        .where("open", "==", true)
        .where("archived", "==", false)
        .get()
        .then(function (querySnapshot: any) {
          querySnapshot.forEach(function (doc: any) {
            let q13 = doc.data();
            delete q13.participants;
            q13 = { ...q13, id: doc.id };
            q13Array.push(q13);
          });
          dispatch({ type: Q13_QUERY, q13Array });
          resolve();
        })
        .catch(function (error: any) {
          console.error("Error getting documents: ", error);
          resolve();
        });
    });

    let getDiaryAvailability = new Promise((resolve, reject) => {
      const data: Array<Diary> = [];
      fireStore
        .collection(collections.PARTICIPANT_DIARY)
        .where("participantId", "==", participantId)
        .where("org", "==", org)
        .get()
        .then(function (querySnapshot: any) {
          querySnapshot.forEach(function (doc: any) {
            let diary = doc.data();
            data.push(diary);
          });
          dispatch({ type: GET_DIARY_ENTRIES, data });
          resolve();
        })
        .catch(function (error: any) {
          console.error("Error getting documents: ", error);
          resolve();
        });
    });

    let getInformedConsents = new Promise((resolve, reject) => {
      let informedConsent: Array<InformedConsent> = [];
      fireStore
        .collection(collections.INFORMED_CONSENT)
        .where("participantId", "==", participantId)
        .where("org", "==", org)
        .get()
        .then(function (querySnapshot: any) {
          querySnapshot.forEach(function (doc: any) {
            // doc.data() is never undefined for query doc snapshots
            const data = doc.data();
            informedConsent.push(data);
          });
          dispatch({ type: SURVEY_INFORMED_CONSENT, informedConsent });
          resolve();
        })
        .catch(function (error: any) {
          console.error("Error getting documents: ", error);
          resolve();
        });
    });

    let getCachedParticipantResponses = new Promise((resolve, reject) => {
      const data: Array<{ id: string; data: ParticipantResponse }> = [];
      fireStore
        .collection(collections.PARTICIPANT_RESPONSE)
        .where("participantId", "==", participantId)
        .where("org", "==", org)
        .get()
        .then(function (querySnapshot: any) {
          querySnapshot.forEach(function (doc: any) {
            // doc.data() is never undefined for query doc snapshots
            data.push({ id: doc.id, data: doc.data() });
          });
          dispatch({ type: Q13_ANSWER_QUERY, data });
          resolve();
        })
        .catch((err: any) => {
          console.error(`Unable to get participant response info ${err}`);
          resolve();
        });
    });

    let loadParticipantInbox = new Promise((resolve, reject) => {
      fireStore
        .collection(collections.INBOX)
        .where("participantId", "==", participantId)
        .where("org", "==", org)
        .get()
        .then(function (querySnapshot: any) {
          let messages: Array<Message> = [];
          // only one should be returned
          querySnapshot.forEach(function (doc: any) {
            if (!isEmptyObject(doc.data())) {
              messages = doc.data().messages;
            }
          });
          dispatch({ type: PARTICIPANT_INBOX, inbox: messages });
          resolve();
        })
        .catch((err: any) => {
          console.error(`Unable to get participant inbox info ${err}`);
          resolve();
        });
    });

    let loadEHRReceipts = new Promise((resolve, reject) => {
      fireStore
        .collection(collections.EHR)
        .where("participantId", "==", participantId)
        .where("org", "==", org)
        .get()
        .then(function (querySnapshot: any) {
          let receipts: Array<EHRReceipt> = [];
          querySnapshot.forEach(function (doc: any) {
            receipts = doc.data().receipts;
          });
          dispatch({ type: GET_EHR_RECEIPTS, ehrReceipts: receipts });
          resolve();
        })
        .catch((err: any) => {
          console.error(`Unable to get ehr info ${err}`);
          resolve();
        });
    });

    let promises = [
      resetQuestionnaire,
      getSurveys,
      getQuestionnaires,
      getDiaryAvailability,
      getCachedParticipantResponses,
      getInformedConsents,
      loadParticipantInbox,
      loadEHRReceipts,
    ];

    Promise.all(promises)
      .then((values) => {
        //Refresh device token
        //
        if (pushEnabled && isPlatform("capacitor")) {
          registerForPush(userId, function (uid: string, token: string) {
            fireStore
              .collection(collections.USERS)
              .doc(uid)
              .set({ token: token }, { merge: true })
              .catch((err: any) => {
                console.error(err);
              });
          })
            .then((res) => {
              if (res === false) {
                fireStore
                  .collection(collections.USERS)
                  .doc(userId)
                  .set({ pushEnabled: false }, { merge: true })
                  .catch((err: any) => {
                    console.error(err);
                  });
                window.alert(
                  "Push notifications are disabled for SHAPE on your phone. You can change this by modifying your device's notification settings."
                );
              }
            })
            .catch((err) => {
              console.error(`Unable to set token info ${err}`);
            });
        }

        batch(() => {
          dispatch({ type: IS_LOADING, isLoading: false });
          dispatch({ type: APPLICATION_READY, isReady: true });
        });
      })
      .catch((e) => {
        console.error(`Unable to fetch data`, e);
        batch(() => {
          dispatch({ type: IS_LOADING, isLoading: false });
          dispatch({ type: APPLICATION_READY, isReady: true });
        });
      });
  };
};

export const setEHRReceipts = (receipts: Array<EHRReceipt>) => {
  return (dispatch: Function, getStates: Function, getFirebase: Function) => {
    dispatch({ type: GET_EHR_RECEIPTS, ehrReceipts: receipts });
  };
};

export const participantInbox = (participantId: string, org: string) => {
  return (dispatch: Function, getStates: Function, getFirebase: Function) => {
    dispatch({ type: IS_LOADING, isLoading: true });

    const fireBase = getFirebase();
    const fireStore = fireBase.firestore();
    fireStore
      .collection(collections.INBOX)
      .where("participantId", "==", participantId)
      .where("org", "==", org)
      .get()
      .then(function (querySnapshot: any) {
        let messages: Array<Message> = [];
        // only one should be returned
        querySnapshot.forEach(function (doc: any) {
          if (!isEmptyObject(doc.data())) {
            messages = doc.data().messages;
          }
        });
        dispatch({ type: PARTICIPANT_INBOX, inbox: messages });
        dispatch({ type: IS_LOADING, isLoading: false });
      })
      .catch((err: any) => {
        console.error(`Unable to get participant inbox info ${err}`);
      });
  };
};

export const markAsRead = (
  participantId: string,
  messageId: string,
  org: string
) => {
  return (dispatch: Function, getStates: Function, getFirebase: Function) => {
    const fireBase = getFirebase();
    const fireStore = fireBase.firestore();
    fireStore
      .collection(collections.INBOX)
      .where("participantId", "==", participantId)
      .where("org", "==", org)
      .get()
      .then(function (querySnapshot: any) {
        // should only find one
        querySnapshot.forEach(function (doc: any) {
          let id = doc.id;
          let messages = doc.data().messages;
          messages.map((message: Message) => {
            if (message.id === messageId) {
              message.read = true;
            }
            return message;
          });

          fireStore
            .collection(collections.INBOX)
            .doc(id)
            .set({ messages: messages }, { merge: true })
            .then((res: any) => {
              dispatch({ type: PARTICIPANT_INBOX, inbox: messages });
            })
            .catch((err: any) => {
              console.error(`Unable to set messaged marked as read ${err}`);
            });
        });
      })
      .catch((err: any) => {
        console.error(`Unable to read messaged marked as read ${err}`);
      });
  };
};

export const deleteMessage = (
  participantId: string,
  messageId: string,
  org: string
) => {
  return (dispatch: Function, getStates: Function, getFirebase: Function) => {
    dispatch({ type: IS_LOADING, isLoading: true });

    const fireBase = getFirebase();
    const fireStore = fireBase.firestore();
    fireStore
      .collection(collections.INBOX)
      .where("participantId", "==", participantId)
      .where("org", "==", org)
      .get()
      .then(function (querySnapshot: any) {
        querySnapshot.forEach(function (doc: any) {
          let id = doc.id;
          let messages = doc.data().messages;
          messages = messages.filter((message: Message) => {
            if (message.id === messageId) {
              return false;
            }
            return true;
          });

          fireStore
            .collection(collections.INBOX)
            .doc(id)
            .set({ messages: messages }, { merge: true })
            .then((res: any) => {
              dispatch({ type: PARTICIPANT_INBOX, inbox: messages });
              dispatch({ type: IS_LOADING, isLoading: false });
            })
            .catch((err: any) => {
              console.error(`Unable to set inbox info ${err}`);
            });
        });
      })
      .catch((err: any) => {
        console.error(`Unable to get inbox info ${err}`);
      });
  };
};

export const updateParticipantDeviceToken = (
  userDocId: string,
  token: string
) => {
  return (dispatch: Function, getStates: Function, getFirebase: Function) => {
    const fireBase = getFirebase();
    const fireStore = fireBase.firestore();
    fireStore
      .collection(collections.USERS)
      .doc(userDocId)
      .set({ token: token }, { merge: true })
      .then((res: any) => {
        if (process.env.NODE_ENV === environments.DEVELOPMENT)
          console.log(`token ${token} successfully stored for ${userDocId}`);
      })
      .catch((err: any) => {
        console.error(`Unable to set device token info ${err}`);
      });
  };
};

export const updateParticipant = (userDocId: string, profile: User) => {
  return (dispatch: Function, getStates: Function, getFirebase: Function) => {
    dispatch({ type: IS_LOADING, isLoading: true });
    try {
      const fireBase = getFirebase();
      const fireStore = fireBase.firestore();
      fireStore
        .collection(collections.USERS)
        .doc(userDocId)
        .set(profile, { merge: true })
        .then(() => {
          dispatch({ type: IS_LOADING, isLoading: false });
          dispatch({ type: UPDATE_PARTICIPANT, profile: profile });
        })
        .catch((err: any) => {
          console.error(`Unable to update participant info ${err}`);
        });
    } catch (e) {
      console.error(`Error updating user preferences ${e}`);
    }
  };
};

export const addParticipantNames = (participants: Array<Person>) => {
  return (dispatch: Function, getStates: Function, getFirebase: Function) => {
    dispatch({ type: ADD_PARTICIPANT_NAMES, names: participants });
  };
};

export const resetparticipantLookup = () => {
  return (dispatch: Function, getStates: Function, getFirebase: Function) => {
    dispatch({ type: PARTICIPANT_LOOKUP_RESET });
  };
};

export const participantLookup = (participantId: string, org: string) => {
  if (process.env.NODE_ENV === environments.DEVELOPMENT)
    console.log(
      `Querying for patient: ${JSON.stringify(participantId)} from org ${org}`
    );
  return (dispatch: Function, getStates: Function, getFirebase: Function) => {
    dispatch({ type: IS_LOADING, isLoading: true });
    const fireBase = getFirebase();
    const fireStore = fireBase.firestore();
    fireStore
      .collection(collections.PARTICIPANT)
      .where("org", "==", org)
      .where("participantId", "==", participantId)
      .where("public", "==", true)
      .get()
      .then(function (querySnapshot: any) {
        // should only return one
        if (querySnapshot.empty) {
          dispatch({ type: IS_LOADING, isLoading: false });
          dispatch({ type: PARTICIPANT_LOOKUP_FAILED });
        } else {
          querySnapshot.forEach(function (doc: any) {
            const participant = doc.data();
            dispatch({ type: ACTIVE_PARTICIPANT, participant });
            dispatch({ type: IS_LOADING, isLoading: false });
          });
        }
      })
      .catch((err: any) => {
        console.error("Error getting documents: ", err);
        dispatch({ type: IS_LOADING, isLoading: false });
        dispatch({ type: PARTICIPANT_LOOKUP_FAILED });
      });
  };
};
