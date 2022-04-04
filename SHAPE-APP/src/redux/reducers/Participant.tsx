import {
  ACTIVE_PARTICIPANT,
  ADD_PARTICIPANT_NAMES,
  PARTICIPANT_ALREADY_REGISTERED,
  PARTICIPANT_CANCELED,
  PARTICIPANT_LOOKUP_FAILED,
  PARTICIPANT_LOOKUP_RESET,
  PARTICIPANT_REMOVE,
  UPDATE_PARTICIPANT,
  PARTICIPANT_INBOX,
} from "../actions/types";
import { Participant, User, Message, Person } from "../../interfaces/DataTypes";

const initialState = { querySuccess: null };

export function participant(
  state = initialState,
  action: { type: string; participant: Participant; profile: User }
) {
  switch (action.type) {
    case ACTIVE_PARTICIPANT:
      const participantData = action.participant;
      return { ...state, ...participantData, querySuccess: true };

    case PARTICIPANT_ALREADY_REGISTERED:
      return {
        participant: null,
        querySuccess: true,
        registrationExists: true,
      };

    case PARTICIPANT_LOOKUP_FAILED:
      return { participant: null, querySuccess: false };

    case PARTICIPANT_REMOVE:
      return initialState;

    case PARTICIPANT_LOOKUP_RESET:
      return initialState;

    case UPDATE_PARTICIPANT:
      const profile = action.profile;
      return { ...state, ...profile, success: true };

    default:
      return state;
  }
}

export function inbox(
  state = [],
  action: { type: string; inbox: Array<Message> }
) {
  switch (action.type) {
    case PARTICIPANT_INBOX:
      return action.inbox;
    default:
      return state;
  }
}

export function names(
  state = [],
  action: { type: string; names: Array<Person> }
) {
  switch (action.type) {
    case ADD_PARTICIPANT_NAMES:
      return action.names;
    case PARTICIPANT_CANCELED:
      return [];

    default:
      return state;
  }
}
