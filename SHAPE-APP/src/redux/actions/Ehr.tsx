import {
  IS_LOADING,
  RESET_EHR_SEARCH,
  RESET_EHR_STATE,
  SET_EHR_ACCESSCODE,
  SET_EHR_ACCOUNTID,
  SET_EHR_BEARER_TOKEN,
  SET_EHR_ERROR,
  SET_EHR_PATIENT,
  SET_EHR_RECORD,
  SET_EHR_SEARCH_RESULT,
  SET_EHR_SELECTED,
} from "./types";
import { batch } from "react-redux";
import { EHR } from "../../interfaces/DataTypes";
import { environments, firebaseFunctions } from "../../utils/Constants";

export const setTargetEHR = (ehr: EHR) => {
  return (dispatch: Function) => {
    dispatch({ type: SET_EHR_SELECTED, payload: ehr });
  };
};

export const resetEHR = () => {
  return (dispatch: Function) => {
    dispatch({ type: RESET_EHR_STATE });
  };
};

export const fetchPatientEHR = (patientId: string, ehr: any) => {
  return (dispatch: Function) => {
    dispatch({ type: IS_LOADING, isLoading: true });
    const { bearerToken, selected } = ehr;
    fetch(
      `${process.env.REACT_APP_BASE_URL}/${firebaseFunctions.GETPATIENTEHR}?patientId=${patientId}&token=${bearerToken}&ehrType=${selected.ehrType}`
    )
      .then((result) => result.json())
      .then((data) => {
        dispatch({
          type: SET_EHR_RECORD,
          payload: data,
        });
        dispatch({ type: IS_LOADING, isLoading: false });
      })
      .catch((e) => {
        console.error(e);
        dispatch({ type: IS_LOADING, isLoading: false });
      });
  };
};

export const patientSearch = (ehr: any) => {
  return (dispatch: Function) => {
    dispatch({ type: IS_LOADING, isLoading: true });
    const { bearerToken, selected } = ehr;
    fetch(
      `${process.env.REACT_APP_BASE_URL}/${firebaseFunctions.GETPATIENT}?token=${bearerToken}&ehrType=${selected.ehrType}`
    )
      .then((result) => result.json())
      .then((data) => {
        const payload = { ...ehr, patient: data };
        dispatch({
          type: SET_EHR_PATIENT,
          payload: payload,
        });
        dispatch({ type: IS_LOADING, isLoading: false });
      })
      .catch((e) => {
        console.error(e);
        dispatch({ type: IS_LOADING, isLoading: false });
      });
  };
};

export const providerSearch = (term: string, token: string) => {
  return (dispatch: Function) => {
    dispatch({ type: IS_LOADING, isLoading: true });
    const url = `${process.env.REACT_APP_BASE_URL}/${firebaseFunctions.SEARCH}?term=${term}&token=${token}`;
    if (term && term !== "") {
      fetch(url)
        .then((result) => result.json())
        .then((providers) => {
          if (providers) {
            const arry: Array<EHR> = [];
            for (const value of Object.values(providers)) {
              //@ts-ignore
              const itemBody = value.value[0];
              const item = {
                //@ts-ignore
                id: value.key,
                name: itemBody.resource.name,
                logo: itemBody.resource.extension[0].valueUri,
                ehrType: determineEHRType(itemBody.resource),
              };
              arry.push(item);
            }
            batch(() => {
              dispatch({
                type: SET_EHR_SEARCH_RESULT,
                payload: arry,
              });
              dispatch({
                type: SET_EHR_ERROR,
                payload: false,
              });
              dispatch({ type: IS_LOADING, isLoading: false });
            });
          } else {
            batch(() => {
              dispatch({
                type: SET_EHR_SEARCH_RESULT,
                payload: [],
              });
              dispatch({
                type: SET_EHR_ERROR,
                payload: false,
              });
              dispatch({ type: IS_LOADING, isLoading: false });
            });
          }
        })
        .catch(() => {
          dispatch({
            type: SET_EHR_ERROR,
            payload: false,
          });
          dispatch({ type: IS_LOADING, isLoading: false });
        });
    } else {
      dispatch({ type: IS_LOADING, isLoading: false });
    }
  };
};

const determineEHRType = (obj: any) => {
  let retVal = "dstu2";
  try {
    if (obj) {
      const ehr = obj.extension.filter((ext: any) => {
        return (
          ext.system ===
          "https://1up.health/dev/concept/doc/1uphealth-system-ehr-type"
        );
      });
      if (ehr && ehr.length > 0) {
        if (
          ehr[0].value.toLowerCase() === "medicare" ||
          ehr[0].value.toLowerCase() === "eclinicalworks"
        ) {
          retVal = "stu3";
        }
      }
    }
  } catch (e) {
    console.error(`Error trying to dermine ehr system, defaulting to dstu2`, e);
  }
  return retVal;
};

export const clearSearch = () => {
  return (dispatch: Function) => {
    dispatch({ type: RESET_EHR_SEARCH });
  };
};

export const getEhrAccessCode = (uid: string) => {
  return (dispatch: Function) => {
    dispatch({ type: IS_LOADING, isLoading: true });

    const url = `${process.env.REACT_APP_BASE_URL}/${firebaseFunctions.GETNEWAUTHCODE}/${uid}`;
    fetch(url)
      .then((result) => result.json())
      .then((userInfo) => {
        if (userInfo) {
          const { success } = userInfo;
          if (success) {
            batch(() => {
              dispatch({
                type: SET_EHR_ACCESSCODE,
                payload: userInfo.code,
              });
              dispatch({
                type: SET_EHR_ERROR,
                payload: false,
              });
            });
          } else {
            batch(() => {
              dispatch({
                type: SET_EHR_ERROR,
                payload: true,
              });
            });
          }
        }
      })
      .catch((e) => {
        console.error(`Error ${e}`);
        batch(() => {
          dispatch({
            type: SET_EHR_ERROR,
            payload: true,
          });
        });
      });
  };
};

export const getEhrBearerToken = (uid: string, accesscode: string) => {
  return (dispatch: Function) => {
    dispatch({ type: IS_LOADING, isLoading: true });

    const url = `${process.env.REACT_APP_BASE_URL}/${firebaseFunctions.GETBEARERTOKEN}?participantId=${uid}&code=${accesscode}`;
    fetch(url)
      .then((response) => response.json())
      .then((userInfo) => {
        if (userInfo) {
          const { access_token } = userInfo;
          if (access_token) {
            batch(() => {
              dispatch({ type: IS_LOADING, isLoading: false });
              dispatch({
                type: SET_EHR_BEARER_TOKEN,
                payload: access_token,
              });
              dispatch({
                type: SET_EHR_ERROR,
                payload: false,
              });
            });
          } else {
            batch(() => {
              dispatch({ type: IS_LOADING, isLoading: false });
              dispatch({
                type: SET_EHR_ERROR,
                payload: true,
              });
            });
          }
        } else {
          dispatch({ type: IS_LOADING, isLoading: false });
        }
      })
      .catch((e) => {
        console.error(`Error ${e}`);
        batch(() => {
          dispatch({
            type: SET_EHR_ERROR,
            payload: true,
          });
          dispatch({ type: IS_LOADING, isLoading: false });
        });
      });
  };
};

export const getEHRUserCode = (uid: string) => {
  return (dispatch: Function) => {
    dispatch({ type: IS_LOADING, isLoading: true });
    const url = `${process.env.REACT_APP_BASE_URL}/${firebaseFunctions.GETUSERCODE}/${uid}`;
    fetch(url)
      .then((result) => result.json())
      .then((userInfo) => {
        if (userInfo) {
          const { success } = userInfo;
          if (!success) {
            const { error } = userInfo;
            if (error === "this user already exists") {
              lookupUser(uid).then((res) => {
                if (res) {
                  batch(() => {
                    dispatch({
                      type: SET_EHR_ACCOUNTID,
                      payload: res,
                    });
                    dispatch({
                      type: SET_EHR_ERROR,
                      payload: false,
                    });
                    dispatch({ type: IS_LOADING, isLoading: false });
                  });
                }
              });
            }
          } else {
            batch(() => {
              dispatch({
                type: SET_EHR_ACCOUNTID,
                payload: userInfo,
              });
              dispatch({
                type: SET_EHR_ERROR,
                payload: false,
              });
              dispatch({ type: IS_LOADING, isLoading: false });
            });
          }
        }
      })
      .catch((e) => {
        console.error(`Error ${e}`);
        dispatch({
          type: SET_EHR_ERROR,
          payload: true,
        });
        dispatch({ type: IS_LOADING, isLoading: false });
      });
  };
};

const lookupUser = (uid: string) => {
  if (process.env.NODE_ENV === environments.DEVELOPMENT)
    console.log(`Trying to locate 1up user id for ${uid}`);
  let userId = "";
  const url = `${process.env.REACT_APP_BASE_URL}/${firebaseFunctions.GETUSERLIST}`;
  return fetch(url)
    .then((result) => result.json())
    .then((list) => {
      if (list) {
        const { entry } = list;
        userId = entry.find((en: any) => {
          return en.app_user_id === uid;
        });
      }
      return userId;
    })
    .catch((e) => {
      console.error(`Error ${e}`);
      return userId;
    });
};
