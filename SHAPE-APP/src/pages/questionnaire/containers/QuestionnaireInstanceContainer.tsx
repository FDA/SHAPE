import React, { Component } from "react";
import { connect } from "react-redux";
import {
  answerQuestion,
  completeQuestionnaire,
  popQuestion,
  pushQuestion,
} from "../../../redux/actions/Questionnaire";
import {
  Answer,
  FirebaseAuth,
  Participant,
  QuestionnaireQuestion,
} from "../../../interfaces/DataTypes";
import { Questionnaire, Profile } from "../../../question/interfaces";
import { Context } from "../../../question/engine/Context";
import QuestionnaireInstance from "../QuestionnaireInstance";
import { RouteComponentProps } from "react-router";

interface PassedProps extends RouteComponentProps {
  fireBaseAuth: FirebaseAuth;
  answerQuestionDispatch: Function;
  questionnaire: any;
  popQuestionDispatch: Function;
  completeQuestionnaireDispatch: Function;
  pushQuestionDispatch: Function;
  surveyId: string;
  selectedProfile: Profile;
  profile: Participant;
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
      pushQuestionDispatch,
      surveyId,
      selectedProfile,
      profile,
      questionnaires,
      questionnaireId,
      history,
      location,
      match,
      id,
    } = this.props;

    return (
      <QuestionnaireInstance
        fireBaseAuth={fireBaseAuth}
        answerQuestion={answerQuestionDispatch}
        questionnaire={questionnaire}
        popQuestion={popQuestionDispatch}
        completeQuestionnaire={completeQuestionnaireDispatch}
        pushQuestion={pushQuestionDispatch}
        surveyId={surveyId}
        selectedProfile={selectedProfile}
        profile={profile}
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
  profile: state.firebase.profile,
  questionnaire: state.questionnaire,
  questionnaires: state.questionnaires,
  selectedProfile: state.selectedProfile,
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
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(QuestionnaireInstanceContainer);
