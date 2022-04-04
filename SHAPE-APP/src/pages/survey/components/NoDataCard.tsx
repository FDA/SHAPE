import React from "react";
import { IonRow, IonCol, IonLabel, IonText } from "@ionic/react";
import { images } from "../../../utils/Constants";

export const NoDataCard: React.FC<any> = () => (
  <span style={{ textAlign: "center" }}>
    <IonRow>
      <IonCol>
        <IonText style={{ fontFamily: "OpenSans", textTransform: "uppercase" }}>
          <h1>Welcome to SHAPE</h1>
        </IonText>
        <img src={images.SHAPE_LOGO_IMAGE} alt="shape-logo" />
      </IonCol>
    </IonRow>
    <IonRow>
      <IonLabel>
        <h1>Survey of Health and Patient Experience</h1>
      </IonLabel>
    </IonRow>
    <IonRow>
      <IonCol style={{ textAlign: "center" }}>
        <img src={images.WAITING_ROOM} alt="waitingroom" />
        <h3>
          It looks like you haven't been enrolled in any surveys or
          questionnaires yet, please check back soon or contact your system
          administrator.
        </h3>
      </IonCol>
    </IonRow>
  </span>
);
