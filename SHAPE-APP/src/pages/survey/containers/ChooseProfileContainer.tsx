import React, { Component } from "react";
import { RouteComponentProps } from "react-router-dom";
import {
  ParticipantResponse,
  FirebaseAuth,
  Questionnaire,
  User,
  Target,
  Person,
} from "../../../interfaces/DataTypes";
import { connect } from "react-redux";
import {
  initializeQuestionnaire,
  setActiveProfile,
} from "../../../redux/actions/Questionnaire";
import ChooseProfile from "../ChooseProfile";

interface PassedProps extends RouteComponentProps {
  questionnaires: Array<Questionnaire>;
  profile: User;
  participantResponse: ParticipantResponse;
  setActiveProfileDispatch: Function;
  initializeQuestionnaireDispatch: Function;
  fireBaseAuth: FirebaseAuth;
}

class ChooseProfileContainer extends Component<PassedProps, {}> {
  render() {
    let {
      fireBaseAuth,
      profile,
      questionnaires,
      participantResponse,
      setActiveProfileDispatch,
      initializeQuestionnaireDispatch,
      history,
      location,
      match,
    } = this.props;
    return (
      <ChooseProfile
        questionnaires={questionnaires}
        profile={profile}
        participantResponse={participantResponse}
        setActiveProfile={setActiveProfileDispatch}
        initializeQuestionnaire={initializeQuestionnaireDispatch}
        fireBaseAuth={fireBaseAuth}
        history={history}
        location={location}
        match={match}
      />
    );
  }
}

const mapStateToProps = (state: any) => ({
  fireBaseAuth: state.firebase.auth,
  profile: state.firebase.profile,
  questionnaires: state.questionnaires,
  participantResponse: state.participantResponse,
});

const mapDispatchToProps = (dispatch: any) => {
  return {
    setActiveProfileDispatch(profile: Person) {
      dispatch(setActiveProfile(profile));
    },
    initializeQuestionnaireDispatch(
      target: Target,
      participantResponse: Array<ParticipantResponse>
    ) {
      dispatch(initializeQuestionnaire(target, participantResponse));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChooseProfileContainer);
