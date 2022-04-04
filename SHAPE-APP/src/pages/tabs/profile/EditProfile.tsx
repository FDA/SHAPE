import React, { Component } from "react";
import {
  IonButton,
  IonFooter,
  IonInput,
  IonItem,
  IonLabel,
  IonToolbar,
} from "@ionic/react";
import PhoneNumberMaskInput from "../../components/PhoneNumberMaskInput";
import { RegisteringUser } from "../../../interfaces/DataTypes";

interface PassedProps {
  toggleEdit: Function;
  user: RegisteringUser;
  isEditing: boolean;
  handleSubmit: Function;
  show: boolean;
  handleChange: Function;
  handlePhone: Function;
}

class EditProfile extends Component<PassedProps, {}> {
  cancel = () => {
    this.props.toggleEdit();
  };

  render() {
    const { user, isEditing, handleSubmit, show, handleChange } = this.props;
    if (!show || !isEditing) {
      return null;
    }
    return (
      <>
        <form id="editProfile" onSubmit={(e) => handleSubmit(e)}>
          <IonItem>
            <IonLabel position="stacked">First Name</IonLabel>
            <IonInput
              name="firstName"
              value={user.firstName}
              required={true}
              onIonInput={(e) => handleChange(e)}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Last Name</IonLabel>
            <IonInput
              name="lastName"
              value={user.lastName}
              required={true}
              onIonInput={(e) => handleChange(e)}
            />
          </IonItem>
          <PhoneNumberMaskInput
            inputHandler={this.props.handlePhone}
            phoneNumber={user.phoneNumber}
            value={user.phoneNumber}
          />
          <IonItem>
            <IonLabel position="stacked">User ID (Email Address)</IonLabel>
            <IonInput
              inputMode="email"
              name="userName"
              value={user.userName}
              required={true}
              disabled={true}
              onIonInput={(e) => handleChange(e)}
            />
          </IonItem>
          <IonFooter className="ion-no-border">
            <IonToolbar>
              <IonButton
                id="cancel"
                expand="block"
                color="light"
                onClick={this.cancel}
              >
                Cancel
              </IonButton>
              <IonButton
                type="submit"
                id="submit"
                expand="block"
                color="primary"
              >
                Save
              </IonButton>
            </IonToolbar>
          </IonFooter>
        </form>
      </>
    );
  }
}

export default EditProfile;
