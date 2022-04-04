import React, { Component } from "react";

import {
  IonButton,
  IonContent,
  IonDatetime,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonRadio,
  IonRadioGroup,
} from "@ionic/react";
import { Person } from "../../interfaces/DataTypes";
import { dateFormats } from "../../utils/Constants";

interface PersonEditorProps {
  person: Person;
  setShowModal: Function;
  handleSubmit: Function;
  handleChange: Function;
  handleRemove: Function;
}

class PersonEditorContent extends Component<PersonEditorProps> {
  render() {
    const {
      person = {
        name: "",
        dob: "",
        isNew: true,
        gender: null,
      },
    } = this.props;
    return (
      <>
        <IonContent className="ion-padding">
          <h2>Participant</h2>
          <h3>Add or change Participant information</h3>
          <p>
            This participant will be available to answer questionnaire questions
            in the application
          </p>
          <IonItem>
            <IonLabel position="stacked">Participant's First Name</IonLabel>
            <IonInput
              data-testid="name-field"
              name="name"
              id="name-field"
              required={true}
              value={person.name}
              autofocus={true}
              onIonInput={(e) => this.props.handleChange(e)}
            />
          </IonItem>
          <IonList style={{ paddingTop: "0px", paddingBottom: "0px" }}>
            <IonRadioGroup
              data-testid="gender-field"
              name="gender"
              id="gender-field"
              onIonChange={(e) => this.props.handleChange(e)}
              value={person.gender}
            >
              <IonItem>
                <IonLabel
                  style={{ fontSize: "24px", fontWeight: "bold" }}
                  position="stacked"
                >
                  Gender
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
              data-testid="date-field"
              id="date-field"
              displayFormat={dateFormats.MMMMDDYYYY}
              name="dob"
              onIonChange={(e) => this.props.handleChange(e)}
              placeholder="Date of Birth"
              value={person.dob}
            />
          </IonItem>

          <IonButton
            type="submit"
            id="submit-button"
            onClick={(e) => this.props.handleSubmit(e)}
            style={{ marginTop: ".5em" }}
            expand="block"
            color="primary"
          >
            Save
          </IonButton>
          {!person.isNew && (
            <IonButton
              type="button"
              id="remove-button"
              onClick={(e) => this.props.handleRemove(e)}
              style={{ marginTop: ".5em" }}
              expand="block"
              fill="solid"
              color="light"
            >
              Remove
            </IonButton>
          )}

          <IonButton
            type="button"
            id="close-button"
            onClick={() => this.props.setShowModal(false)}
            style={{ marginTop: ".5em" }}
            expand="block"
            fill="solid"
            color="light"
          >
            Close without Saving
          </IonButton>
        </IonContent>
      </>
    );
  }
}

export default PersonEditorContent;
