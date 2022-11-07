import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import {
    User,
    FirebaseAuth,
    ParticipantResponse,
    Questionnaire,
    ParticipantObject
} from '../../../interfaces/DataTypes';
import {
    getAllPreviewQuestionnaires,
    getQuestionnaires,
    setQuestionnaireView
} from '../../../redux/actions/Questionnaire';
import { connect } from 'react-redux';
import ChooseQuestionnaire from '../ChooseQuestionnaire';
import { refreshAll } from '../../../redux/actions/Participant';

interface PassedProps extends RouteComponentProps {
    profile: User;
    fireBaseAuth: FirebaseAuth;
    refreshAllDispatch: Function;
    questionnaireView: string;
    setQuestionnaireViewDispatch: Function;
    getAllPreviewQuestionnairesDispatch: Function;
    getQuestionnairesDispatch: Function;
    questionnaires: Array<Questionnaire>;
    participantResponse: Array<ParticipantResponse>;
}

interface ChooseQuestionnaireState {
    surveyId: string;
}

class ChooseQuestionnaireContainer extends Component<PassedProps, ChooseQuestionnaireState> {
    render() {
        const {
            profile,
            fireBaseAuth,
            refreshAllDispatch,
            questionnaireView,
            setQuestionnaireViewDispatch,
            getAllPreviewQuestionnairesDispatch,
            getQuestionnairesDispatch,
            questionnaires,
            participantResponse,
            history,
            location,
            match
        } = this.props;

        return (
            <ChooseQuestionnaire
                profile={profile}
                fireBaseAuth={fireBaseAuth}
                refreshAll={refreshAllDispatch}
                questionnaireView={questionnaireView}
                setQuestionnaireView={setQuestionnaireViewDispatch}
                getAllPreviewQuestionnaires={getAllPreviewQuestionnairesDispatch}
                getQuestionnaires={getQuestionnairesDispatch}
                questionnaires={questionnaires}
                participantResponse={participantResponse}
                history={history}
                location={location}
                match={match}
            />
        );
    }
}

const mapStateToProps = (state: any) => ({
    questionnaireView: state.questionnaireView,
    profile: state.firebase.profile,
    fireBaseAuth: state.firebase.auth,
    questionnaires: state.questionnaires,
    participantResponse: state.participantResponse
});

const mapDispatchToProps = (dispatch: any) => {
    return {
        refreshAllDispatch() {
            dispatch(refreshAll());
        },
        setQuestionnaireViewDispatch(view: string) {
            dispatch(setQuestionnaireView(view));
        },
        getQuestionnairesDispatch(participantId: Array<ParticipantObject>) {
            dispatch(getQuestionnaires(participantId));
        },
        getAllPreviewQuestionnairesDispatch(surveyId: string) {
            dispatch(getAllPreviewQuestionnaires(surveyId));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ChooseQuestionnaireContainer);
