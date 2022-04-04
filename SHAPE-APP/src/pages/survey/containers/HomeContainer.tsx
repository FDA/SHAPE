import React, { Component } from "react";
import {
  Survey,
  User,
  FirebaseAuth,
  InformedConsent,
  Questionnaire,
} from "../../../interfaces/DataTypes";
import { RouteComponentProps } from "react-router-dom";
import { connect } from "react-redux";
import { agreeToInformedConsent } from "../../../redux/actions/Questionnaire";
import { refreshAll } from "../../../redux/actions/Participant";
import Home from "../Home";

interface PassedProps extends RouteComponentProps {
  profile: User;
  fireBaseAuth: FirebaseAuth;
  agreeToInformedConsentDispatch: Function;
  consent: Array<InformedConsent>;
  refreshAllDispatch: Function;
  surveys: Array<Survey>;
  loading: boolean;
  darkMode: boolean;
  firebaseLoggedIn: boolean;
  questionnaires: Array<Questionnaire>;
}

class HomeContainer extends Component<PassedProps, {}> {
  render() {
    let {
      profile,
      fireBaseAuth,
      agreeToInformedConsentDispatch,
      consent,
      refreshAllDispatch,
      surveys,
      loading,
      darkMode,
      firebaseLoggedIn,
      questionnaires,
      history,
      location,
      match,
    } = this.props;
    return (
      <Home
        profile={profile}
        fireBaseAuth={fireBaseAuth}
        agreeToInformedConsent={agreeToInformedConsentDispatch}
        consent={consent}
        refreshAll={refreshAllDispatch}
        surveys={surveys}
        loading={loading}
        darkMode={darkMode}
        firebaseLoggedIn={firebaseLoggedIn}
        questionnaires={questionnaires}
        history={history}
        location={location}
        match={match}
      />
    );
  }
}

const mapStateToProps = (state: any) => ({
  loading: state.loading,
  profile: state.firebase.profile,
  fireBaseAuth: state.firebase.auth,
  surveys: state.surveys,
  consent: state.consent,
  questionnaires: state.questionnaires,
});

const mapDispatchToProps = (dispatch: any) => {
  return {
    agreeToInformedConsentDispatch(
      participantId: string,
      surveyId: string,
      email: string
    ) {
      dispatch(agreeToInformedConsent(participantId, surveyId, email));
    },
    refreshAllDispatch(
      org: string,
      participantId: string,
      userId: string,
      pushEnabled: boolean
    ) {
      dispatch(refreshAll(org, participantId, userId, pushEnabled));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeContainer);
