import React, { Component } from "react";
import { connect } from "react-redux";
import { setReadyState } from "./redux/actions/Questionnaire";
import { refreshAll } from "./redux/actions/Participant";
import { FirebaseAuth, User } from "./interfaces/DataTypes";
import SplashScreen from "./SplashScreen";

interface PassedProps {
  setReadyStateDispatch: Function;
  fireBaseAuth: FirebaseAuth;
  applicationReady: boolean;
  refreshAllDispatch: Function;
  previewMode: boolean;
  firebaseLoggedIn: boolean;
  profile: User;
  children: any;
}

class SplashScreenContainer extends Component<PassedProps, {}> {
  render() {
    let {
      fireBaseAuth,
      applicationReady,
      previewMode,
      firebaseLoggedIn,
      refreshAllDispatch,
      profile,
      children,
      setReadyStateDispatch,
    } = this.props;
    return (
      <SplashScreen
        setReadyState={setReadyStateDispatch}
        fireBaseAuth={fireBaseAuth}
        applicationReady={applicationReady}
        refreshAll={refreshAllDispatch}
        previewMode={previewMode}
        firebaseLoggedIn={firebaseLoggedIn}
        profile={profile}
        children={children}
      />
    );
  }
}

const mapStateToProps = (state: any) => ({
  fireBaseAuth: state.firebase.auth,
  profile: state.firebase.profile,
  applicationReady: state.applicationReady,
  previewMode: state.previewMode,
});

const mapDispatchToProps = (dispatch: any) => {
  return {
    setReadyStateDispatch(newState: boolean) {
      setReadyState(newState);
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SplashScreenContainer);
