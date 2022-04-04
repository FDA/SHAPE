import React, { Component } from "react";
import { connect } from "react-redux";
import {
  participantInbox,
  deleteMessage,
} from "../../../../redux/actions/Participant";
import {
  User,
  Message as MessageType,
  FirebaseAuth,
} from "../../../../interfaces/DataTypes";
import Message from "../Message";

interface PassedProps {
  profile: User;
  participantInboxDispatch: Function;
  message: MessageType;
  deleteMessageDispatch: Function;
  closeMessage: Function;
  fireBaseAuth: FirebaseAuth;
}

class MessageContainer extends Component<PassedProps, {}> {
  render() {
    let {
      message,
      fireBaseAuth,
      closeMessage,
      profile,
      participantInboxDispatch,
      deleteMessageDispatch,
    } = this.props;

    return (
      <Message
        profile={profile}
        loadParticipantInbox={participantInboxDispatch}
        message={message}
        deleteMessage={deleteMessageDispatch}
        closeMessage={closeMessage}
        fireBaseAuth={fireBaseAuth}
      />
    );
  }
}

const mapStateToProps = (state: any) => ({
  fireBaseAuth: state.firebase.auth,
  profile: state.firebase.profile,
});

const mapDispatchToProps = (dispatch: any) => ({
  participantInboxDispatch(participantId: string, org: string) {
    dispatch(participantInbox(participantId, org));
  },
  deleteMessageDispatch(participantId: string, messageId: string, org: string) {
    dispatch(deleteMessage(participantId, messageId, org));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(MessageContainer);
