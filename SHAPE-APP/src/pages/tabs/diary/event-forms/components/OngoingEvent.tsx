import React from "react";
import {
  IonItem,
  IonLabel,
  IonSelect,
  IonText,
  IonSelectOption,
} from "@ionic/react";
import { ongoingArr } from "../DiaryMappings";

interface PassedProps {
  handleInputChange: Function;
  value: any;
}

export const OngoingEvent = (props: PassedProps) => {
  let { handleInputChange, value } = props;
  return (
    <IonItem lines="none">
      <IonLabel position="stacked">
        Is the Event Ongoing?<IonText color="danger">*</IonText>
      </IonLabel>
      <IonSelect
        className="rounded-input"
        name="ongoingStatus"
        value={value}
        okText="Ok"
        cancelText="Cancel"
        onIonChange={(e) => handleInputChange(e)}
      >
        {ongoingArr.map((choice: any) => {
          return (
            <IonSelectOption key={choice.val} value={choice.val}>
              {choice.text}
            </IonSelectOption>
          );
        })}
      </IonSelect>
    </IonItem>
  );
};
