import { SET_DIARY_AVAILABILITY, GET_DIARY_ENTRIES } from "../actions/types";
import { Diary, DiaryResponse } from "../../interfaces/DataTypes";

let initialAvailableDiaries: Array<Diary> = [];

export function availableDiaries(
  state = initialAvailableDiaries,
  action: { type: string; data: Array<Diary> }
) {
  switch (action.type) {
    case SET_DIARY_AVAILABILITY:
      return [...action.data];
    default:
      return state;
  }
}

export function userDiaryEntries(
  state = [],
  action: { type: string; data: Array<DiaryResponse> }
) {
  switch (action.type) {
    case GET_DIARY_ENTRIES:
      return [...action.data];
    default:
      return state;
  }
}
