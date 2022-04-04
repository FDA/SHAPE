import React, { Component, ReactNode } from "react";
import {
  IonButton,
  IonContent,
  IonDatetime,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonRadio,
  IonRadioGroup,
} from "@ionic/react";
import { format } from "date-fns";
import { Person } from "../../../interfaces/DataTypes";
import { dateFormats } from "../../../utils/Constants";
import { guid } from "../../../utils";

export interface PassedProps {
  children?: ReactNode;
  person: Person;
  setShowModal: Function;
  cancel: Function;
  showModal: boolean;
  handleSubmit: Function;
  handleChange: Function;
  handleRemove: Function;
}

class PersonEditor extends Component<PassedProps, {}> {
  cancel = () => {
    this.props.cancel();
  };

  render() {
    const maxDate = format(new Date(), dateFormats.yyyyMMdd);
    const {
      person = {
        name: "",
        dob: "",
        isNew: true,
        gender: "",
        id: guid(),
      },
    } = this.props;
    const disableEdit = person.isNew;
    return (
      <IonModal
        isOpen={this.props.showModal}
        swipeToClose={false}
        onDidDismiss={() => this.props.setShowModal(false)}
      >
        <IonContent className="ion-padding">
          <IonHeader>
            <h2>Participant</h2>
          </IonHeader>
          <h3>Add or change Participant information</h3>
          <p>
            This participant will be available to answer questionnaire questions
            in the application
          </p>
          <IonItem>
            <IonLabel position="stacked">Participant's First Name</IonLabel>
            {disableEdit && (
              <IonInput
                name="name"
                required={true}
                value={person.name}
                autofocus={true}
                onIonInput={(e) => this.props.handleChange(e)}
              />
            )}
            {!disableEdit && <h2>{person.name}</h2>}
          </IonItem>
          <IonList style={{ paddingTop: "0px", paddingBottom: "0px" }}>
            <IonRadioGroup
              name="gender"
              onIonChange={(e) => this.props.handleChange(e)}
              value={person.gender}
            >
              <IonItem>
                <IonLabel
                  style={{ fontSize: "24px", fontWeight: "bold" }}
                  position="stacked"
                >
                  <h3>Gender</h3>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>Female</IonLabel>
                <IonRadio slot="start" value="F" />
              </IonItem>

              <IonItem>
                <IonLabel>Male</IonLabel>
                <IonRadio slot="start" value="M" />
              </IonItem>
            </IonRadioGroup>
          </IonList>
          <IonItem>
            <IonLabel position="stacked">Date of Birth</IonLabel>
            <IonDatetime
              displayFormat={dateFormats.MMMMDDYYYY}
              name="dob"
              max={maxDate}
              onIonChange={(e) => this.props.handleChange(e)}
              placeholder="Date of Birth"
              value={person.dob}
            />
          </IonItem>

          <IonButton
            type="submit"
            onClick={(e) => this.props.handleSubmit(e)}
            expand="block"
            color="primary"
          >
            Save
          </IonButton>
          {!person.isNew && (
            <IonButton
              type="button"
              onClick={(e) => this.props.handleRemove(e)}
              expand="block"
              fill="solid"
              color="warning"
            >
              Remove
            </IonButton>
          )}

          <IonButton
            type="button"
            onClick={this.cancel}
            style={{ marginTop: ".5em" }}
            expand="block"
            fill="solid"
            color="light"
          >
            Cancel
          </IonButton>
        </IonContent>
      </IonModal>
    );
  }
}

export default PersonEditor;
