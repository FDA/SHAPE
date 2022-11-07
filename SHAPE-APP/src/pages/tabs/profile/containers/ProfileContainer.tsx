import React, { Component } from "react";
import {
  updateParticipant,
  updateParticipantDeviceToken,
} from "../../../../redux/actions/Participant";
import {
  logout,
  resetPassword,
} from "../../../../redux/actions/Authentication";
import { connect } from "react-redux";
import { resetEHR } from "../../../../redux/actions/Ehr";
import { User, FirebaseAuth } from "../../../../interfaces/DataTypes";
import Profile from "../Profile";

interface PassedProps {
  logoutDispatch: Function;
  profile: User;
  fireBaseAuth: FirebaseAuth;
  resetEHRDispatch: Function;
  resetPasswordDispatch: Function;
  updateParticipantDeviceTokenDispatch: Function;
  updateParticipantDispatch: Function;
  isLoading: boolean;
}

class ProfileContainer extends Component<PassedProps, {}> {
  render() {
    const {
      logoutDispatch,
      profile,
      fireBaseAuth,
      resetEHRDispatch,
      resetPasswordDispatch,
      isLoading,
      updateParticipantDispatch,
      updateParticipantDeviceTokenDispatch,
    } = this.props;
    return (
      <Profile
        logout={logoutDispatch}
        profile={profile}
        fireBaseAuth={fireBaseAuth}
        resetEHR={resetEHRDispatch}
        resetPassword={resetPasswordDispatch}
        updateParticipantDeviceToken={updateParticipantDeviceTokenDispatch}
        updateParticipant={updateParticipantDispatch}
        isLoading={isLoading}
      />
    );
  }
}

const mapStateToProps = (state: any) => ({
  fireBaseAuth: state.firebase.auth,
  profile: state.firebase.profile,
  isLoading: state.loading,
});

const mapDispatchToProps = (dispatch: any) => ({
  updateParticipantDispatch(userDocId: string, profile: User) {
    dispatch(updateParticipant(userDocId, profile));
  },
  resetEHRDispatch() {
    dispatch(resetEHR());
  },
  resetPasswordDispatch(user: any) {
    dispatch(resetPassword(user));
  },
  logoutDispatch() {
    dispatch(logout());
  },
  updateParticipantDeviceTokenDispatch(userDocId: string, token: string) {
    dispatch(updateParticipantDeviceToken(userDocId, token));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ProfileContainer);
