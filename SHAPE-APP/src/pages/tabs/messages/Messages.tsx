import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import {
  IonContent,
  IonPage,
  IonItem,
  IonText,
  IonLabel,
  IonList,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonRefresherContent,
  IonRefresher,
} from "@ionic/react";
import { isEmptyObject } from "../../../utils/Utils";
import { format, compareDesc } from "date-fns";
import AppHeader from "../../layout/AppHeader";
import MessageContainer from "./containers/MessageContainer";
import Loading from "../../layout/Loading";
import { RefresherEventDetail } from "@ionic/core";
import { Message, User, FirebaseAuth } from "../../../interfaces/DataTypes";
import { routes, dateFormats } from "../../../utils/Constants";

interface PassedProps {
  profile: User;
  loadParticipantInbox: Function;
  markAsRead: Function;
  fireBaseAuth: FirebaseAuth;
  refreshAll: Function;
  inbox: Array<Message>;
  isLoading: boolean;
}

interface MessagesState {
  showMessage: boolean;
  message: Message;
}

class Messages extends Component<PassedProps, MessagesState> {
  constructor(props: PassedProps) {
    super(props);

    this.state = {
      showMessage: false,
      message: {
        id: "0",
        message: "Error fetching message",
        read: true,
        subject: "Error fetching message",
        timestamp: "",
      },
    };
  }

  UNSAFE_componentWillMount() {
    let { profile } = this.props;
    this.props.loadParticipantInbox(profile.participantId, profile.org);
  }

  openMessage = (message: Message) => {
    let { profile, markAsRead } = this.props;

    let messageId = message.id;
    let { participantId, org } = profile;

    if (message.read !== true) {
      markAsRead(participantId, messageId, org);
    }

    this.setState({ showMessage: true, message: message });
  };

  closeMessage = () => {
    this.setState({
      showMessage: false,
      message: {
        id: "0",
        message: "Error fetching message",
        read: true,
        subject: "Error fetching message",
        timestamp: "",
      },
    });
  };

  getStyle = (read: boolean) => {
    if (read) return "light";
    else return "";
  };

  refreshState = (event: CustomEvent<RefresherEventDetail>) => {
    const { profile, fireBaseAuth } = this.props;
    this.props.refreshAll(
      profile.org,
      profile.participantId,
      fireBaseAuth.uid,
      profile.pushEnabled
    );
    event.detail.complete();
  };

  render() {
    let { inbox, fireBaseAuth, isLoading } = this.props;
    let { isEmpty } = fireBaseAuth;
    let { showMessage, message } = this.state;

    if (isEmpty) return <Redirect to={routes.LOGIN} />;

    let sortedInbox = [...inbox].sort((a: Message, b: Message) =>
      compareDesc(new Date(a.timestamp), new Date(b.timestamp)) ? 1 : -1
    );

    return (
      <IonPage>
        <AppHeader showHeader={!isEmpty} text={"Messages"} />
        <IonContent color="light">
          <IonRefresher
            slot="fixed"
            onIonRefresh={this.refreshState}
            pullFactor={0.5}
            pullMin={100}
            pullMax={200}
          >
            <IonRefresherContent />
          </IonRefresher>
          <IonList style={{ padding: 0 }}>
            {!showMessage &&
              !isEmptyObject(inbox) &&
              sortedInbox.map((m: Message, index: number) => {
                return (
                  <IonItem
                    color={this.getStyle(m.read)}
                    lines="full"
                    onClick={() => this.openMessage(m)}
                    key={index}
                    detail
                  >
                    <IonLabel position="fixed">
                      {format(new Date(m.timestamp), dateFormats.MMddyyyy)}
                    </IonLabel>
                    <IonText>{m.subject}</IonText>
                  </IonItem>
                );
              })}
            {!showMessage && isEmptyObject(inbox) && (
              <IonCard style={{ textAlign: "center" }}>
                <IonCardHeader>
                  <IonCardTitle>No Messages Currently Available</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>Check back later!</IonCardContent>
              </IonCard>
            )}
            {showMessage && (
              <MessageContainer
                message={message}
                closeMessage={this.closeMessage}
              />
            )}
          </IonList>
          {isLoading && <Loading />}
        </IonContent>
      </IonPage>
    );
  }
}

export default Messages;
