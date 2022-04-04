import React, { Component } from "react";
import { IonItem, IonLabel, IonToggle } from "@ionic/react";
import { RegisteringUser } from "../../../interfaces/DataTypes";

interface PassedProps {
  setChecked: Function;
  handleSubmit: Function;
  user: RegisteringUser;
  show: boolean;
}

class EditPreferences extends Component<PassedProps, {}> {
  changeSelect = (event: string, flag: boolean, e: any) => {
    this.props.setChecked(event, flag);
    this.props.handleSubmit(e);
  };

  render() {
    const { user, show, handleSubmit } = this.props;
    if (!show) {
      return null;
    }
    return (
      <>
        <form onSubmit={(e) => handleSubmit(e)}>
          <IonItem lines="none">
            <IonLabel
              position="stacked"
              slot="start"
              className="ion-text-wrap prefs"
              style={{ padding: "4px" }}
            >
              Allow Email Notifications
            </IonLabel>
            <IonToggle
              checked={user.emailEnabled}
              slot="end"
              onIonChange={(e: any) =>
                this.changeSelect("emailEnabled", e.detail.checked, e)
              }
            />
          </IonItem>
          <IonItem lines="none">
            <IonLabel
              position="stacked"
              slot="start"
              className="ion-text-wrap prefs"
              style={{ padding: "4px" }}
            >
              Allow SMS Notifications{" "}
              <span style={{ fontSize: "10px", color: "lightgrey" }}>
                *Message and data rates may apply.
              </span>
            </IonLabel>
            <IonToggle
              checked={user.smsEnabled}
              slot="end"
              onIonChange={(e: any) =>
                this.changeSelect("smsEnabled", e.detail.checked, e)
              }
            />
          </IonItem>
          <IonItem lines="none">
            <IonLabel
              position="stacked"
              slot="start"
              className="ion-text-wrap prefs"
              style={{ padding: "4px" }}
            >
              Allow Push Notifications
            </IonLabel>
            <IonToggle
              checked={user.pushEnabled}
              slot="end"
              onIonChange={(e: any) =>
                this.changeSelect("pushEnabled", e.detail.checked, e)
              }
            />
          </IonItem>
        </form>
      </>
    );
  }
}

export default EditPreferences;
