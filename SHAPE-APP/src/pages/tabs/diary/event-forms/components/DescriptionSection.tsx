import React from "react";
import { IonItem, IonLabel, IonTextarea, IonText } from "@ionic/react";

interface PassedProps {
  value: string;
  handleInputChange: Function;
}

export const DescriptionSection = (props: PassedProps) => {
  let { value, handleInputChange } = props;
  return (
    <IonItem
      style={{
        paddingBottom: "10px",
      }}
    >
      <IonLabel position="stacked">
        Describe the Event<IonText color="danger">*</IonText>
      </IonLabel>
      <IonTextarea
        placeholder="Describe the event"
        className="form-textbox"
        name="descriptionData"
        value={value}
        rows={4}
        cols={20}
        onIonChange={(e) => handleInputChange(e)}
      />
    </IonItem>
  );
};
