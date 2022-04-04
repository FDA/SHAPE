import {
    Q13,
    Q13_UPDATE,
    STORE_QUESTIONNAIRE_LIST,
    UPDATE_QUESTIONNAIRE_LIST,
    REMOVE_FROM_QUESTIONNAIRE_LIST,
    ADD_TO_QUESTIONNAIRE_LIST
} from '../actions/types';

export function questionnaire(state = {}, action) {
    const {data} = action;

    switch (action.type) {
        case Q13:
            return data;

        case Q13_UPDATE:
            return data;

        default:
            return state;
    }
}

export function questionnaireList(state = [], action) {
    const {data} = action;

    switch (action.type) {
        case STORE_QUESTIONNAIRE_LIST:
            return data;

        case ADD_TO_QUESTIONNAIRE_LIST:
            let newList = state.slice();
            newList.splice(0, 0, data);
            return newList;

        case REMOVE_FROM_QUESTIONNAIRE_LIST:
            let filteredList = state.slice();
            filteredList = filteredList.filter((elem) => {
                return elem.id !== data.questionnaireId;
            });
            return filteredList;

        case UPDATE_QUESTIONNAIRE_LIST:
            let updatedList = state.slice();
            updatedList = updatedList.map((elem) => {
                if (elem.id === data.id) return data;
                else return elem;
            });
            return updatedList;

        default:
            return state;
    }
}
