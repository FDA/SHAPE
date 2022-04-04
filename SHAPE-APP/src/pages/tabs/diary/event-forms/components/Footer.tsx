import React from "react";
import { IonFooter, IonToolbar, IonButton, IonText } from "@ionic/react";
import { diaryViews } from "../../../../../utils/Constants";

interface PassedProps {
  setView: Function;
  handleSave: Function;
  error: boolean;
}

export const Footer = (props: PassedProps) => {
  return (
    <IonFooter className="ion-no-border">
      <IonToolbar>
        {props.error && (
          <IonText color="danger">
            All required fields are not completed.
          </IonText>
        )}
        <IonButton
          type="button"
          expand="block"
          onClick={() => props.handleSave()}
        >
          Save
        </IonButton>
        <IonButton
          type="button"
          expand="block"
          color="danger"
          onClick={() => props.setView(diaryViews.SURVEYSELECTION)}
        >
          Cancel
        </IonButton>
      </IonToolbar>
    </IonFooter>
  );
};
