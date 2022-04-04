import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import {
  IonToolbar,
  IonText,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCardContent,
  IonFooter,
} from "@ionic/react";
import {
  User,
  Message as MessageType,
  FirebaseAuth,
} from "../../../interfaces/DataTypes";
import { routes } from "../../../utils/Constants";

interface PassedProps {
  profile: User;
  loadParticipantInbox: Function;
  message: MessageType;
  deleteMessage: Function;
  closeMessage: Function;
  fireBaseAuth: FirebaseAuth;
}

class Message extends Component<PassedProps, {}> {
  deleteMessage = () => {
    let { profile, message, deleteMessage, closeMessage } = this.props;
    let { participantId, org } = profile;
    let messageId = message.id;

    deleteMessage(participantId, messageId, org);
    closeMessage();
  };

  render() {
    let { message, fireBaseAuth, closeMessage } = this.props;
    let { isEmpty } = fireBaseAuth;

    if (isEmpty) return <Redirect to={routes.LOGIN} />;

    return (
      <>
        <IonButton
          fill="clear"
          size="small"
          onClick={() => closeMessage()}
        >{`< Back`}</IonButton>
        <IonCard>
          <IonCardHeader color="light">
            <IonCardTitle>{message.subject}</IonCardTitle>
            <IonCardSubtitle>{message.timestamp}</IonCardSubtitle>
          </IonCardHeader>
          <IonCardContent style={{ paddingTop: 10 }}>
            <IonText>{message.message}</IonText>
          </IonCardContent>
          <IonFooter>
            <IonToolbar
              style={{
                paddingLeft: "6px",
                paddingBottom: "4px",
                paddingRight: "6px",
              }}
            >
              <IonButton
                slot="end"
                color="danger"
                fill="clear"
                size="small"
                onClick={() => this.deleteMessage()}
              >
                Delete
              </IonButton>
            </IonToolbar>
          </IonFooter>
        </IonCard>
      </>
    );
  }
}

export default Message;
