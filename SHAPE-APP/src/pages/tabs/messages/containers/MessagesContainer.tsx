import React, { Component } from "react";
import { connect } from "react-redux";
import {
  participantInbox,
  markAsRead,
  refreshAll,
} from "../../../../redux/actions/Participant";
import { Inbox, User, FirebaseAuth } from "../../../../interfaces/DataTypes";
import Messages from "../Messages";

interface PassedProps {
  profile: User;
  participantInboxDispatch: Function;
  markAsReadDispatch: Function;
  fireBaseAuth: FirebaseAuth;
  refreshAllDispatch: Function;
  inbox: Array<Inbox>;
  isLoading: boolean;
}

class MessagesContainer extends Component<PassedProps, {}> {
  render() {
    const {
      profile,
      participantInboxDispatch,
      markAsReadDispatch,
      fireBaseAuth,
      refreshAllDispatch,
      inbox,
      isLoading,
    } = this.props;
    return (
      <Messages
        profile={profile}
        loadParticipantInbox={participantInboxDispatch}
        markAsRead={markAsReadDispatch}
        fireBaseAuth={fireBaseAuth}
        refreshAll={refreshAllDispatch}
        inbox={inbox}
        isLoading={isLoading}
      />
    );
  }
}

const mapStateToProps = (state: any) => ({
  fireBaseAuth: state.firebase.auth,
  isLoading: state.loading,
  participant: state.participant,
  names: state.names,
  profile: state.firebase.profile,
  inbox: state.inbox,
});

const mapDispatchToProps = (dispatch: any) => ({
  participantInboxDispatch() {
    dispatch(participantInbox());
  },
  markAsReadDispatch(messageId: string) {
    dispatch(markAsRead(messageId));
  },
  refreshAllDispatch() {
    dispatch(refreshAll());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(MessagesContainer);
