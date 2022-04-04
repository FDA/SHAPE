import React, { Component } from "react";
import { IonItem, IonLabel, IonText } from "@ionic/react";
import { FirebaseAuth, User } from "../../../interfaces/DataTypes";

interface PassedProps {
  profile: User;
  fireBaseAuth: FirebaseAuth;
  isEditing: boolean;
  show: boolean;
}

class ViewProfile extends Component<PassedProps, {}> {
  render() {
    const { profile, fireBaseAuth, isEditing, show } = this.props;
    if (!show || isEditing) {
      return null;
    }
    return (
      <>
        <IonItem>
          <IonLabel position="stacked">First Name</IonLabel>
          <IonText>{profile.firstName}</IonText>
        </IonItem>
        <IonItem>
          <IonLabel position="stacked">Last Name</IonLabel>
          <IonText>{profile.lastName}</IonText>
        </IonItem>
        <IonItem>
          <IonLabel position="stacked">
            Telephone Number (Voice and SMS)
          </IonLabel>
          <IonText>{profile.phoneNumber}</IonText>
        </IonItem>
        <IonItem>
          <IonLabel position="stacked">User ID (Email Address)</IonLabel>
          <IonText>{fireBaseAuth.email}</IonText>
        </IonItem>
      </>
    );
  }
}

export default ViewProfile;
