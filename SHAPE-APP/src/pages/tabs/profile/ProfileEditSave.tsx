import React, { Component } from "react";
import { IonButton, IonFooter, IonToolbar, IonIcon } from "@ionic/react";
import { linkSharp } from "ionicons/icons";
import { routes } from "../../../utils/Constants";

interface PassedProps {
  isEditing: boolean;
  toggleEdit: Function;
  show: boolean;
}

class ProfileEditSave extends Component<PassedProps, {}> {
  cancel = () => {
    this.props.toggleEdit();
  };

  render() {
    const { isEditing, toggleEdit, show } = this.props;
    if (!show && !isEditing) {
      return null;
    } else if (show && !isEditing) {
      return (
        <IonFooter className="ion-no-border">
          <IonToolbar>
            <IonButton
              type="button"
              routerLink={routes.EHR}
              expand="block"
              fill="solid"
              color="light"
            >
              <IonIcon icon={linkSharp} /> &nbsp; Link EHR Records
            </IonButton>
            <IonButton
              expand="block"
              color="primary"
              onClick={() => toggleEdit()}
            >
              Edit Profile
            </IonButton>
          </IonToolbar>
        </IonFooter>
      );
    } else {
      return null;
    }
  }
}

export default ProfileEditSave;
