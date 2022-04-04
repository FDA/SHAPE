import React, { Component } from "react";
import { connect } from "react-redux";
import {
  isLoading,
  logout,
  register,
} from "../../../redux/actions/Authentication";
import { resetparticipantLookup } from "../../../redux/actions/Participant";
import {
  Participant,
  Person,
  AuthenticationObject,
  FirebaseAuth,
  User,
} from "../../../interfaces/DataTypes";
import Register from "../Register";

interface PassedProps {
  participant: Participant;
  names: Array<Person>;
  toggleLoading: Function;
  registerUser: Function;
  logoutUser: Function;
  loading: boolean;
  authentication: AuthenticationObject;
  fireBaseAuth: FirebaseAuth;
  resetLookup: Function;
  authError: string | null;
}

interface RegisterContainerState {}

class RegisterContainer extends Component<PassedProps, RegisterContainerState> {
  render() {
    let {
      participant,
      names,
      toggleLoading,
      registerUser,
      logoutUser,
      loading,
      authentication,
      fireBaseAuth,
      resetLookup,
      authError,
    } = this.props;

    return (
      <Register
        participant={participant}
        names={names}
        toggleLoading={toggleLoading}
        register={registerUser}
        logout={logoutUser}
        loading={loading}
        authentication={authentication}
        fireBaseAuth={fireBaseAuth}
        resetparticipantLookup={resetLookup}
        authError={authError}
      />
    );
  }
}

export const mapStateToProps = (state: any) => ({
  fireBaseAuth: state.firebase.auth,
  loading: state.loading,
  participant: state.participant,
  names: state.names,
  authentication: state.authentication,
  authError: state.authentication.authError,
});

export const mapDispatchToProps = (dispatch: any) => ({
  registerUser(user: User) {
    dispatch(register(user));
  },
  resetLookup() {
    dispatch(resetparticipantLookup());
  },
  toggleLoading(loading: boolean) {
    dispatch(isLoading(loading));
  },
  logoutUser() {
    dispatch(logout());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(RegisterContainer);
