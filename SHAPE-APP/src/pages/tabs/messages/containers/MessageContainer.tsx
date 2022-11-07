import React, { Component } from "react";
import { connect } from "react-redux";
import {
  participantInbox,
  deleteMessage,
} from "../../../../redux/actions/Participant";
import {
  User,
  Inbox,
  FirebaseAuth,
} from "../../../../interfaces/DataTypes";
import Message from "../Message";

interface PassedProps {
  profile: User;
  participantInboxDispatch: Function;
  message: Inbox;
  deleteMessageDispatch: Function;
  closeMessage: Function;
  fireBaseAuth: FirebaseAuth;
  showMessage: boolean;
  router: HTMLElement;
}

class MessageContainer extends Component<PassedProps, {}> {
  render() {
    const {
      message,
      fireBaseAuth,
      closeMessage,
      profile,
      participantInboxDispatch,
      deleteMessageDispatch,
      showMessage,
      router
    } = this.props;

    return (
      <Message
        profile={profile}
        loadParticipantInbox={participantInboxDispatch}
        message={message}
        deleteMessage={deleteMessageDispatch}
        closeMessage={closeMessage}
        fireBaseAuth={fireBaseAuth}
        showMessage={showMessage}
        router={router}
      />
    );
  }
}

const mapStateToProps = (state: any) => ({
  fireBaseAuth: state.firebase.auth,
  profile: state.firebase.profile,
});

const mapDispatchToProps = (dispatch: any) => ({
  participantInboxDispatch() {
    dispatch(participantInbox());
  },
  deleteMessageDispatch(messageId: string) {
    dispatch(deleteMessage(messageId));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(MessageContainer);
