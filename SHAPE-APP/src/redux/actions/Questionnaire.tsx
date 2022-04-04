import {
  APPLICATION_READY,
  Q13_ANSWER,
  Q13_ANSWER_QUERY,
  Q13_ANSWER_WRITE,
  Q13_ANSWERS_FROM_COLLECTION,
  Q13_QUERY,
  Q13_RESET,
  Q13_STACK_POP,
  Q13_STACK_PUSH,
  SET_ACTIVE_PROFILE,
  SURVEY_INFORMED_CONSENT_AGREED,
  SET_PREVIEW_ORG,
} from "./types";
import { batch } from "react-redux";
import {
  Answer,
  Target,
  ParticipantResponse,
  QuestionnaireQuestion,
  Person,
  Questionnaire,
  Response,
} from "../../interfaces/DataTypes";
import {
  collections,
  environments,
  firebaseFunctions,
} from "../../utils/Constants";
import { Context } from "../../question/engine/Context";

export const answerQuestion = (answer: Answer) => {
  return (dispatch: Function, getStates: Function, getFirebase: Function) => {
    dispatch({ type: Q13_ANSWER, answer });
  };
};

export const initializeQuestionnaire = (
  target: Target,
  participantResponse: Array<ParticipantResponse>
) => {
  return (dispatch: Function, getStates: Function, getFirebase: Function) => {
    let responses: Array<Response> = [];
    let previousAnswers = participantResponse.find((item) => {
      const { surveyId, questionnaireId } = target;
      return (
        surveyId === item.surveyId &&
        questionnaireId === item.questionnaireId &&
        target.participantId === item.participantId &&
        item.profile === target.profileName
      );
    });
    if (previousAnswers) {
      responses = previousAnswers.responses;
    }
    dispatch({ type: Q13_ANSWERS_FROM_COLLECTION, responses });
  };
};

export const pushQuestion = (question: QuestionnaireQuestion) => {
  return (dispatch: Function, getStates: Function, getFirebase: Function) => {
    dispatch({ type: Q13_STACK_PUSH, question });
  };
};

export const popQuestion = () => {
  return (dispatch: Function, getStates: Function, getFirebase: Function) => {
    dispatch({ type: Q13_STACK_POP });
  };
};

export const setReadyState = (newState: boolean) => {
  return (dispatch: Function, getStates: Function, getFirebase: Function) => {
    dispatch({ type: APPLICATION_READY, newState });
  };
};

export const setActiveProfile = (data: Person) => {
  return (dispatch: Function, getStates: Function, getFirebase: Function) => {
    dispatch({ type: SET_ACTIVE_PROFILE, data });
  };
};

export const agreeToInformedConsent = (
  partipantId: string,
  surveyId: string,
  email: string
) => {
  return (dispatch: Function, getStates: Function, getFirebase: Function) => {
    const fireBase = getFirebase();
    const fireStore = fireBase.firestore();
    const state = getStates();
    const org = state.firebase.profile.org;

    const docData = {
      participantId: partipantId,
      org: org,
      surveyId: surveyId,
      emailSent: email,
      dateAgreed: fireBase.firestore.Timestamp.fromDate(new Date()),
    };
    fireStore
      .collection(collections.INFORMED_CONSENT)
      .add(docData)
      .then(async function () {
        if (process.env.NODE_ENV === environments.DEVELOPMENT)
          console.log("Document successfully written!");
        dispatch({ type: SURVEY_INFORMED_CONSENT_AGREED, payload: docData });
        let url = `${process.env.REACT_APP_BASE_URL}/${firebaseFunctions.SENDMAIL}`;
        const headers = {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        };
        let body = {
          recipient: email,
          surveyId: surveyId,
        };

        return fetch(url, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(body),
          mode: "cors",
        });
      })
      .catch(function (error: any) {
        console.error("Error getting documents: ", error);
      });
  };
};

export const completeQuestionnaire = (
  context: Context,
  completeStatus: boolean = false
) => {
  return (dispatch: Function, getStates: Function, getFirebase: Function) => {
    if (process.env.NODE_ENV === environments.DEVELOPMENT)
      console.log("completeQuestionnaire");
    const fireBase = getFirebase();
    const fireStore = fireBase.firestore();
    const state = getStates();
    const org = state.firebase.profile.org;
    let isNew = true;
    const { questionnaire, participantResponse } = state;
    let docData: ParticipantResponse = {
      id: context.id,
      participantId: context.participant,
      org: org,
      profile: context.profile.name,
      profileDOB: context.profile.dob,
      questionnaireId: context.questionnaire,
      surveyId: context.survey,
      responses: [],
      dateWritten: fireBase.firestore.Timestamp.fromDate(new Date()),
      complete: completeStatus,
    };

    const saveTemplate = JSON.stringify(questionnaire);
    const saveObject = JSON.parse(saveTemplate); // deep copy
    delete saveObject.questionStack;
    for (let entry of Object.entries(saveObject)) {
      if (entry[1] !== undefined) {
        const response: Response = {
          question: entry[0],
          response: entry[1] as string,
        };
        docData.responses.push(response);
      }
    }

    const previousAnswers = participantResponse.find(
      (item: ParticipantResponse) => {
        dispatch(setReadyState(false));
        return (
          docData.surveyId === item.surveyId &&
          docData.questionnaireId === item.questionnaireId &&
          docData.participantId === item.participantId &&
          item.profile === docData.profile
        );
      }
    );
    if (previousAnswers) {
      isNew = false;
      docData.id = previousAnswers.id;
    }
    if (isNew) {
      fireStore
        .collection(collections.PARTICIPANT_RESPONSE)
        .add(docData)
        .then(function (docRef: any) {
          if (process.env.NODE_ENV === environments.DEVELOPMENT)
            console.log("Document successfully created!!");
          docData.id = docRef.id;
          dispatch(setReadyState(true));
        })
        .catch((err: any) => {
          console.error(`Unable to st response info ${err}`);
        });
    } else {
      fireStore
        .collection(collections.PARTICIPANT_RESPONSE)
        .doc(docData.id)
        .set(docData)
        .then(function () {
          if (process.env.NODE_ENV === environments.DEVELOPMENT)
            console.log("Document successfully written!");
          dispatch(setReadyState(true));
        })
        .catch((err: any) => {
          console.error(`Unable to set participant response info ${err}`);
        });
    }
    batch(() => {
      dispatch(resetQuestionnaire());
      dispatch(mergeParticipantAnswers(docData));
    });
  };
};

const mergeParticipantAnswers = (docData: ParticipantResponse) => {
  return (dispatch: Function, getStates: Function, getFirebase: Function) => {
    dispatch({ type: Q13_ANSWER_WRITE, data: docData });
  };
};

export const resetQuestionnaire = () => {
  return (dispatch: Function, getStates: Function, getFirebase: Function) => {
    if (process.env.NODE_ENV === environments.DEVELOPMENT)
      console.log("Requesting Q13_RESET");
    dispatch({ type: Q13_RESET });
  };
};

const processQuestionnaires = (querySnapshot: any) => {
  const data: Array<Questionnaire> = [];
  querySnapshot.forEach(function (doc: any) {
    let q13 = doc.data();
    delete q13.participants;
    q13 = { ...q13, id: doc.id };
    data.push(q13);
  });
  return data;
};

export const getQuestionnaires = (participantId: string, org: string) => {
  return (dispatch: Function, getStates: Function, getFirebase: Function) => {
    const fireBase = getFirebase();
    const fireStore = fireBase.firestore();
    fireStore
      .collection(collections.QUESTIONNAIRE)
      .where("participants", "array-contains", participantId)
      .where("org", "==", org)
      .where("open", "==", true)
      .where("archived", "==", false)
      .get()
      .then(function (querySnapshot: any) {
        let q13Array = processQuestionnaires(querySnapshot);
        dispatch({ type: Q13_QUERY, q13Array });
      })
      .catch(function (error: any) {
        if (process.env.NODE_ENV === environments.DEVELOPMENT)
          console.log("Error getting documents: ", error);
      });
  };
};

export const getAllPreviewQuestionnaires = (
  surveyId: string,
  participantId: string
) => {
  return (dispatch: Function, getStates: Function, getFirebase: Function) => {
    const fireBase = getFirebase();
    const fireStore = fireBase.firestore();
    fireStore
      .collection(collections.QUESTIONNAIRE)
      .where("surveyId", "==", surveyId)
      .get()
      .then(function (querySnapshot: any) {
        let q13Array = processQuestionnaires(querySnapshot);
        dispatch({ type: Q13_QUERY, q13Array });
      })
      .catch(function (error: any) {
        if (process.env.NODE_ENV === environments.DEVELOPMENT)
          console.log("Error getting documents: ", error);
      });
  };
};

export const getOnePreviewQuestionnaire = (
  questionnaireId: string,
  refreshToken: string
) => {
  return (dispatch: Function, getStates: Function, getFirebase: Function) => {
    const fireBase = getFirebase();
    const fbFunctions = fireBase.functions();
    const getPreviewToken = fbFunctions.httpsCallable(
      firebaseFunctions.GETPREVIEWTOKEN
    );

    getPreviewToken({ token: refreshToken }, null)
      .then((result: { data: any }) => {
        const { data } = result;
        const { customToken, org } = data;
        fireBase
          .auth()
          .signInWithCustomToken(customToken)
          .then(() => {
            dispatch({ type: SET_PREVIEW_ORG, org });
            const fireStore = fireBase.firestore();
            fireStore
              .collection(collections.QUESTIONNAIRE)
              .doc(questionnaireId)
              .get()
              .then(function (doc: any) {
                const q13Array: Array<Questionnaire> = [];
                let q13 = doc.data();
                delete q13.participants;
                q13 = { ...q13, id: doc.id };
                q13Array.push(q13);
                dispatch({ type: Q13_QUERY, q13Array });
              })
              .catch(function (error: any) {
                console.error("Error getting documents: ", error);
              });
          })
          .catch((e: any) =>
            console.error(`Unable to sign in with custom token ${e}`)
          );
      })
      .catch((e: any) => {
        console.error(`Unable to fetch custom token ${e}`);
      });
  };
};

export const getParticipantResponses = (
  surveyId: string,
  questionnaireId: string,
  participantId: string,
  profile: string
) => {
  return (dispatch: Function, getStates: Function, getFirebase: Function) => {
    const fireBase = getFirebase();
    const fireStore = fireBase.firestore();
    const data: Array<{ id: string; data: ParticipantResponse }> = [];
    fireStore
      .collection(collections.PARTICIPANT_RESPONSE)
      .where("surveyId", "==", surveyId)
      .where("questionnaireId", "==", questionnaireId)
      .where("participantId", "==", participantId)
      .where("profile", "==", profile)
      .get()
      .then(function (querySnapshot: any) {
        querySnapshot.forEach(function (doc: any) {
          // doc.data() is never undefined for query doc snapshots
          if (process.env.NODE_ENV === environments.DEVELOPMENT)
            console.log(doc.id, " => ", doc.data());
          data.push({ id: doc.id, data: doc.data() });
        });
        dispatch({ type: Q13_ANSWER_QUERY, data });
      })
      .catch(function (error: any) {
        console.error("Error getting documents: ", error);
      });
  };
};
