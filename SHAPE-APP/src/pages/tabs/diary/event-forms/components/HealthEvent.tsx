import React from "react";
import {
  IonItem,
  IonLabel,
  IonSelect,
  IonText,
  IonSelectOption,
  IonInput,
} from "@ionic/react";
import { optionsArr } from "../DiaryMappings";

interface PassedProps {
  handleInputChange: Function;
  value: any;
  healthEventSpecification: string;
}

export const HealthEvent = (props: PassedProps) => {
  let { handleInputChange, value, healthEventSpecification } = props;

  return (
    <>
      <IonItem lines="none">
        <IonLabel position="stacked">
          Health Event<IonText color="danger">*</IonText>
        </IonLabel>
        <IonSelect
          className="rounded-input"
          name="healthEvent"
          value={value}
          okText="Ok"
          cancelText="Cancel"
          onIonChange={(e) => handleInputChange(e)}
        >
          {optionsArr.map((choice: { val: number; text: string }) => {
            return (
              <IonSelectOption key={choice.val} value={choice.val}>
                {choice.text}
              </IonSelectOption>
            );
          })}
        </IonSelect>
      </IonItem>
      {value === 10 && (
        <IonItem>
          <IonLabel position="stacked">
            Specify Health Event
            <IonText color="danger">*</IonText>
          </IonLabel>

          <IonInput
            className="rounded-input"
            value={healthEventSpecification}
            name="healthEventSpecification"
            onIonChange={(e) => handleInputChange(e)}
          />
        </IonItem>
      )}
    </>
  );
};
