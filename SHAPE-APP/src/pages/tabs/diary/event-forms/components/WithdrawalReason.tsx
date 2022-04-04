import React from "react";
import { IonItem, IonLabel, IonTextarea, IonText } from "@ionic/react";

interface PassedProps {
  value: any;
  handleInputChange: Function;
}

export const WithdrawalReason = (props: PassedProps) => {
  let { value, handleInputChange } = props;
  return (
    <IonItem
      style={{
        paddingBottom: "10px",
      }}
    >
      <IonLabel position="stacked">
        Reason for Withdrawal<IonText color="danger">*</IonText>
      </IonLabel>
      <IonTextarea
        placeholder="Reason for withdrawal"
        className="form-textbox"
        name="withdrawalReason"
        value={value}
        rows={4}
        cols={20}
        onIonChange={(e) => handleInputChange(e)}
      />
    </IonItem>
  );
};
