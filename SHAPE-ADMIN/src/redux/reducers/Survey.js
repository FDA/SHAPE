import {
    SURVEY,
    SURVEY_UPDATE,
    STORE_SURVEY_LIST,
    ADD_TO_SURVEY_LIST,
    REMOVE_FROM_SURVEY_LIST,
    UPDATE_SURVEY_LIST
} from '../actions/types';

export function survey(state = {}, action) {
    const {data} = action;

    switch (action.type) {
        case SURVEY:
            return data;

        case SURVEY_UPDATE:
            return data;

        default:
            return state;
    }
}

export function surveyList(state = [], action) {
    const {data} = action;

    switch (action.type) {
        case STORE_SURVEY_LIST:
            return data;

        case ADD_TO_SURVEY_LIST:
            let newList = state.slice();
            newList.splice(0, 0, data);
            return newList;

        case REMOVE_FROM_SURVEY_LIST:
            let filteredList = state.slice();
            filteredList = filteredList.filter((elem) => {
                return elem.id !== data.questionnaireId;
            });
            return filteredList;

        case UPDATE_SURVEY_LIST:
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
