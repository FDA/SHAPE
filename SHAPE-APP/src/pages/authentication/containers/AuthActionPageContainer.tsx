import React, { Component } from "react";
import { RouteComponentProps } from "react-router-dom";
import {
  validateThenResetPassword,
  verifyEmail,
} from "../../../redux/actions/Authentication";
import { connect } from "react-redux";
import AuthActionPage from "../AuthActionPage";

interface PassedProps extends RouteComponentProps {
  validate: Function;
  isLoading: boolean;
  authError: string;
  darkMode: boolean;
  verifyUserEmail: Function;
  passwordChangeSuccess: boolean;
}

class AuthActionPageContainer extends Component<PassedProps, {}> {
  render() {
    const {
      validate,
      isLoading,
      authError,
      darkMode,
      verifyUserEmail,
      passwordChangeSuccess,
      history,
      match,
      location,
    } = this.props;
    return (
      <AuthActionPage
        validateThenResetPassword={validate}
        isLoading={isLoading}
        authError={authError}
        darkMode={darkMode}
        verifyEmail={verifyUserEmail}
        history={history}
        match={match}
        location={location}
        passwordChangeSuccess={passwordChangeSuccess}
      />
    );
  }
}

export const mapStateToProps = (state: any) => ({
  isLoading: state.loading,
  darkMode: state.darkMode,
  authError: state.authentication.authError,
  passwordChangeSuccess: state.authentication.passwordChangeSuccess
});

export const mapDispatchToProps = (dispatch: any) => ({
  validate(code: string, password: string) {
    dispatch(validateThenResetPassword(code, password));
  },
  verifyUserEmail(code: string) {
    dispatch(verifyEmail(code));
  },
});

// Connected Component
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AuthActionPageContainer);
