import {
  RESET_EHR_SEARCH,
  RESET_EHR_STATE,
  SET_EHR_ACCESSCODE,
  SET_EHR_ACCOUNTID,
  SET_EHR_BEARER_TOKEN,
  SET_EHR_ERROR,
  SET_EHR_LINK_SUCCESS,
  SET_EHR_PATIENT,
  SET_EHR_RECORD,
  SET_EHR_SEARCH_RESULT,
  SET_EHR_SELECTED,
  GET_EHR_RECEIPTS,
} from "../actions/types";
import { EHRReceipt } from "../../interfaces/DataTypes";

export function ehr(state = {}, action: { type: string; payload: any }) {
  const { payload } = action;
  switch (action.type) {
    case SET_EHR_ACCOUNTID:
      return {
        ...state,
        OneUpUserId: payload.oneup_user_id,
        appUserId: payload.app_user_id,
      };
    case SET_EHR_ACCESSCODE:
      return { ...state, accesscode: payload };
    case SET_EHR_BEARER_TOKEN:
      return { ...state, bearerToken: payload };
    case SET_EHR_ERROR:
      return { ...state, error: payload };
    case SET_EHR_SEARCH_RESULT:
      return { ...state, searchResult: payload };
    case SET_EHR_SELECTED:
      return { ...state, selected: payload };
    case SET_EHR_PATIENT:
      return { ...state, ...payload };
    case SET_EHR_RECORD:
      return { ...state, healthRecord: payload };
    case SET_EHR_LINK_SUCCESS:
      return { linkSucces: true };
    case RESET_EHR_STATE:
      state = {};
      return state;
    case RESET_EHR_SEARCH:
      state = { ...state, searchResult: [] };
      return state;

    default:
      return state;
  }
}

export function receipt(
  state = {},
  action: { type: string; ehrReceipts: Array<EHRReceipt> }
) {
  const { ehrReceipts } = action;
  switch (action.type) {
    case GET_EHR_RECEIPTS:
      return { ...state, ehrReceipts };

    default:
      return state;
  }
}
