import React from "react";

import { IonToast } from "@ionic/react";

export const Toast: React.FC<{
  onDidDismiss: Function;
  message: string;
  color: string;
  isOpen: boolean;
}> = (props) => {
  return (
    <IonToast
      color={props.color}
      position={"bottom"}
      isOpen={props.isOpen}
      message={props.message}
      duration={3000}
      onDidDismiss={() => props.onDidDismiss()}
      buttons={[
        {
          text: "x",
          role: "cancel",
        },
      ]}
    />
  );
};
