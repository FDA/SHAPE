import React, { Component } from "react";
import { connect } from "react-redux";
import {
  answerQuestion,
  popQuestion,
  pushQuestion,
  getOnePreviewQuestionnaire,
  resetQuestionnaire,
} from "../../../redux/actions/Questionnaire";
import { isLoading, logout } from "../../../redux/actions/Authentication";
import {
  Answer,
  FirebaseAuth,
  User,
  QuestionnaireQuestion,
} from "../../../interfaces/DataTypes";
import { Questionnaire, Profile } from "../../../question/interfaces";
import { RouteComponentProps } from "react-router";
import QuestionnairePreview from "../QuestionnairePreview";

interface PassedProps extends RouteComponentProps {
  fireBaseAuth: FirebaseAuth;
  getOnePreviewQuestionnaireDispatch: Function;
  resetQuestionnaireDispatch: Function;
  isLoadingDispatch: Function;
  questionnaire: any;
  previewAuthenticationDispatch: Function;
  answerQuestionDispatch: Function;
  logoutDispatch: Function;
  pushQuestionDispatch: Function;
  popQuestionDispatch: Function;
  selectedProfile: Profile;
  profile: User;
  questionnaires: Array<Questionnaire>;
}

class QuestionnairePreviewContainer extends Component<PassedProps, {}> {
  render() {
    let {
      fireBaseAuth,
      getOnePreviewQuestionnaireDispatch,
      resetQuestionnaireDispatch,
      isLoadingDispatch,
      questionnaire,
      previewAuthenticationDispatch,
      answerQuestionDispatch,
      logoutDispatch,
      pushQuestionDispatch,
      popQuestionDispatch,
      selectedProfile,
      profile,
      questionnaires,
      history,
      match,
      location,
    } = this.props;
    return (
      <QuestionnairePreview
        fireBaseAuth={fireBaseAuth}
        getOnePreviewQuestionnaire={getOnePreviewQuestionnaireDispatch}
        resetQuestionnaire={resetQuestionnaireDispatch}
        isLoading={isLoadingDispatch}
        questionnaire={questionnaire}
        previewAuthentication={previewAuthenticationDispatch}
        answerQuestion={answerQuestionDispatch}
        logout={logoutDispatch}
        pushQuestion={pushQuestionDispatch}
        popQuestion={popQuestionDispatch}
        selectedProfile={selectedProfile}
        profile={profile}
        questionnaires={questionnaires}
        history={history}
        match={match}
        location={location}
      />
    );
  }
}

const mapStateToProps = (state: any) => ({
  fireBaseAuth: state.firebase.auth,
  profile: state.firebase.profile,
  questionnaire: state.questionnaire,
  questionnaires: state.questionnaires,
});

const mapDispatchToProps = (dispatch: any) => ({
  answerQuestionDispatch(answer: Answer) {
    dispatch(answerQuestion(answer));
  },
  pushQuestionDispatch(question: QuestionnaireQuestion) {
    dispatch(pushQuestion(question));
  },
  popQuestionDispatch() {
    dispatch(popQuestion());
  },
  getOnePreviewQuestionnaireDispatch(
    questionnaireId: string,
    decodedToken: string
  ) {
    dispatch(getOnePreviewQuestionnaire(questionnaireId, decodedToken));
  },
  isLoadingDispatch(bool: boolean) {
    dispatch(isLoading(bool));
  },
  logoutDispatch() {
    dispatch(logout());
  },
  resetQuestionnaireDispatch() {
    dispatch(resetQuestionnaire());
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(QuestionnairePreviewContainer);
