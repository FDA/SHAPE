import React, { Component } from "react";
import {
  authentication,
  resetUserState,
} from "../../../redux/actions/Authentication";
import {
  Account,
  FirebaseAuth,
  AuthenticationObject,
} from "../../../interfaces/DataTypes";
import { connect } from "react-redux";
import Login from "../Login";

interface PassedProps {
  authenticationDispatch: Function;
  resetUserStateDispatch: Function;
  isLoading: boolean;
  darkMode: boolean;
  fireBaseAuth: FirebaseAuth;
  passwordChangeSuccess: boolean;
  passwordResetSuccess: boolean;
  emailVerificationResendSuccess: boolean;
  emailVerificationSuccess: boolean;
  auth: AuthenticationObject;
}

class LoginContainer extends Component<PassedProps, {}> {
  render() {
    let {
      authenticationDispatch,
      resetUserStateDispatch,
      isLoading,
      darkMode,
      fireBaseAuth,
      passwordChangeSuccess,
      passwordResetSuccess,
      emailVerificationResendSuccess,
      emailVerificationSuccess,
      auth,
    } = this.props;
    return (
      <Login
        authentication={authenticationDispatch}
        resetUserState={resetUserStateDispatch}
        isLoading={isLoading}
        darkMode={darkMode}
        fireBaseAuth={fireBaseAuth}
        passwordChangeSuccess={passwordChangeSuccess}
        passwordResetSuccess={passwordResetSuccess}
        emailVerificationResendSuccess={emailVerificationResendSuccess}
        emailVerificationSuccess={emailVerificationSuccess}
        auth={auth}
      />
    );
  }
}

const mapStateToProps = (state: any) => ({
  isLoading: state.loading,
  fireBaseAuth: state.firebase.auth,
  darkMode: state.darkMode,
  auth: state.authentication,
  passwordResetSuccess: state.authentication.passwordResetSuccess,
  passwordChangeSuccess: state.authentication.passwordChangeSuccess,
  emailVerificationResendSuccess:
    state.authentication.emailVerificationResendSuccess,
  emailVerificationSuccess: state.authentication.emailVerificationSuccess,
});

const mapDispatchToProps = (dispatch: {
  (arg0: (dispatch: any, getStates: any, getFirebase: any) => void): void;
  (arg0: (dispatch: any, getStates: any, getFirebase: any) => void): void;
}) => ({
  authenticationDispatch(user: Account) {
    dispatch(authentication(user));
  },
  resetUserStateDispatch() {
    dispatch(resetUserState());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(LoginContainer);
