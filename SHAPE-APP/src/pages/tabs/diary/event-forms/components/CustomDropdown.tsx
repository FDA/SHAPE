import React from "react";
import {
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonText,
} from "@ionic/react";

interface PassedProps {
  name: string;
  label: string;
  value: any;
  handleInputChange: Function;
  optionsArr: Array<{ val: number; text: string }>;
}

export const CustomDropdown = (props: PassedProps) => {
  let { name, label, value, handleInputChange, optionsArr } = props;
  return (
    <IonItem lines="none">
      <IonLabel position="stacked" class="ion-text-wrap">
        {`${label}`}
        <IonText color="danger">*</IonText>
      </IonLabel>
      <IonSelect
        className="rounded-input"
        name={`${name}`}
        value={value}
        okText="Ok"
        cancelText="Cancel"
        onIonChange={(e) => handleInputChange(e)}
      >
        {optionsArr.map((choice: any) => {
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
