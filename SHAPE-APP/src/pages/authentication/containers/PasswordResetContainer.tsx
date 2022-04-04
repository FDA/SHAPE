import React, { Component } from "react";
import { resetPassword } from "../../../redux/actions/Authentication";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router-dom";
import PasswordReset from "../PasswordReset";

interface PassedProps extends RouteComponentProps {
  resetPass: Function;
  isLoading: boolean;
  authError: string;
}

interface PasswordResetState {}

class PasswordResetContainer extends Component<
  PassedProps,
  PasswordResetState
> {
  render() {
    const { resetPass, isLoading, authError, history, location, match } =
      this.props;

    return (
      <PasswordReset
        resetPassword={resetPass}
        isLoading={isLoading}
        authError={authError}
        history={history}
        location={location}
        match={match}
      />
    );
  }
}

export const mapStateToProps = (state: any) => ({
  isLoading: state.loading,
  authError: state.authentication.authError,
});

export const mapDispatchToProps = (dispatch: any) => ({
  resetPass(userName: string) {
    dispatch(resetPassword(userName));
  },
});

// Connected Component
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PasswordResetContainer);
