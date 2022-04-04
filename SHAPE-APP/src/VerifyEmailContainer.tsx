import React, { Component } from "react";
import {
  logout,
  resendVerificationEmail,
} from "./redux/actions/Authentication";
import { connect } from "react-redux";
import VerifyEmail from "./VerifyEmail";

interface PassedProps {
  logoutDispatch: Function;
  darkMode: boolean;
  resendVerificationEmailDispatch: Function;
}

class VerifyEmailContainer extends Component<PassedProps, {}> {
  render() {
    const { darkMode, logoutDispatch, resendVerificationEmailDispatch } =
      this.props;
    return (
      <VerifyEmail
        logout={logoutDispatch}
        darkMode={darkMode}
        resendVerificationEmail={resendVerificationEmailDispatch}
      />
    );
  }
}

const mapStateToProps = (state: any) => ({
  darkMode: state.darkMode,
});

const mapDispatchToProps = (dispatch: any) => {
  return {
    logoutDispatch() {
      dispatch(logout());
    },
    resendVerificationEmailDispatch() {
      dispatch(resendVerificationEmail());
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(VerifyEmailContainer);
