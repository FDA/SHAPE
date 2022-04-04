import React, { Component } from "react";
import { connect } from "react-redux";
import {
  clearAuthError,
  resetResendVerification,
} from "../../../redux/actions/Authentication";
import LoginCard from "../LoginCard";

interface PassedProps {
  darkMode: boolean;
  firebaseLoggedIn: boolean;
  emailVerificationResendSuccess: boolean;
  authError: string | null;
  resetResendVerificationDispatch: Function;
  clearAuthErrorDispatch: Function;
}

class LoginCardContainer extends Component<PassedProps, {}> {
  render() {
    let {
      darkMode,
      firebaseLoggedIn,
      emailVerificationResendSuccess,
      authError,
      resetResendVerificationDispatch,
      clearAuthErrorDispatch,
    } = this.props;
    return (
      <LoginCard
        darkMode={darkMode}
        firebaseLoggedIn={firebaseLoggedIn}
        emailVerificationResendSuccess={emailVerificationResendSuccess}
        authError={authError}
        resetResendVerification={resetResendVerificationDispatch}
        clearAuthError={clearAuthErrorDispatch}
      />
    );
  }
}

const mapStateToProps = (state: any) => ({
  darkMode: state.darkMode,
  authError: state.authentication.authError,
  emailVerificationResendSuccess:
    state.authentication.emailVerificationResendSuccess,
});

const mapDispatchToProps = (dispatch: any) => {
  return {
    clearAuthErrorDispatch() {
      dispatch(clearAuthError());
    },
    resetResendVerificationDispatch() {
      dispatch(resetResendVerification());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginCardContainer);
