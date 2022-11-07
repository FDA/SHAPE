import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    answerQuestion,
    completeQuestionnaire,
    popQuestion,
    pushQuestion,
    resetQuestionnaire
} from '../../../redux/actions/Questionnaire';
import {
    Answer,
    FirebaseAuth,
    User,
    QuestionnaireQuestion,
    ParticipantResponse
} from '../../../interfaces/DataTypes';
import { Questionnaire, Profile } from '../../../question/interfaces';
import { Context } from '../../../question/engine/Context';
import QuestionnaireInstance from '../QuestionnaireInstance';
import { RouteComponentProps } from 'react-router';

interface PassedProps extends RouteComponentProps {
    fireBaseAuth: FirebaseAuth;
    answerQuestionDispatch: Function;
    questionnaire: { questionStack: Array<any> };
    popQuestionDispatch: Function;
    completeQuestionnaireDispatch: Function;
    resetQuestionnaireDispatch: Function;
    pushQuestionDispatch: Function;
    surveyId: string;
    selectedProfile: Profile;
    participantResponses: ParticipantResponse[];
    profile: User;
    questionnaires: Array<Questionnaire>;
    questionnaireId: string;
    id: string;
}

class QuestionnaireInstanceContainer extends Component<PassedProps, {}> {
    render() {
        const {
            fireBaseAuth,
            answerQuestionDispatch,
            questionnaire,
            popQuestionDispatch,
            completeQuestionnaireDispatch,
            resetQuestionnaireDispatch,
            pushQuestionDispatch,
            surveyId,
            selectedProfile,
            profile,
            participantResponses,
            questionnaires,
            questionnaireId,
            history,
            location,
            match,
            id
        } = this.props;

        return (
            <QuestionnaireInstance
                fireBaseAuth={fireBaseAuth}
                answerQuestion={answerQuestionDispatch}
                questionnaire={questionnaire}
                popQuestion={popQuestionDispatch}
                completeQuestionnaire={completeQuestionnaireDispatch}
                resetQuestionnaire={resetQuestionnaireDispatch}
                pushQuestion={pushQuestionDispatch}
                surveyId={surveyId}
                selectedProfile={selectedProfile}
                profile={profile}
                participantResponses={participantResponses}
                questionnaires={questionnaires}
                questionnaireId={questionnaireId}
                history={history}
                location={location}
                match={match}
                id={id}
            />
        );
    }
}

const mapStateToProps = (state: any) => ({
    fireBaseAuth: state.firebase.auth,
    participantResponses: state.participantResponse,
    profile: state.firebase.profile,
    questionnaire: state.questionnaire,
    questionnaires: state.questionnaires,
    selectedProfile: state.selectedProfile
});

const mapDispatchToProps = (dispatch: any) => ({
    answerQuestionDispatch(answer: Answer) {
        dispatch(answerQuestion(answer));
    },
    completeQuestionnaireDispatch(context: Context, completeStatus: boolean) {
        dispatch(completeQuestionnaire(context, completeStatus));
    },
    pushQuestionDispatch(question: QuestionnaireQuestion) {
        dispatch(pushQuestion(question));
    },
    popQuestionDispatch() {
        dispatch(popQuestion());
    },
    resetQuestionnaireDispatch() {
        dispatch(resetQuestionnaire());
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(QuestionnaireInstanceContainer);
