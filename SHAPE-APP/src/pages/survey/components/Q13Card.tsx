import React from "react";
import { ColoredLine } from "./";
import { Q13, ParticipantResponse } from "../../../interfaces/DataTypes";
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonLabel,
} from "@ionic/react";

export const Q13Card: React.FC<Q13> = (q13) => {
  let { participantResponse } = q13;
  let matchedResp = participantResponse.filter(
    (res: ParticipantResponse) => res.questionnaireId === q13.id
  );
  let status = "Not Started";
  let color = "#2A7CBA";
  if (matchedResp && matchedResp.length > 0) {
    let hasComplete = matchedResp.some(
      (res: ParticipantResponse) => res.complete
    );
    status = hasComplete ? "Complete" : "In Progress";
    color = hasComplete ? "#66B584" : "#F7987A";
  }

  return (
    <IonCard button={true} routerLink={q13.href}>
      <IonCardHeader>
        <IonCardTitle>{q13.name}</IonCardTitle>
        <IonCardSubtitle>{q13.shortDescription}</IonCardSubtitle>
      </IonCardHeader>
      <IonCardContent>{q13.description}</IonCardContent>
      <ColoredLine />
      <IonCardContent style={{ fontFamily: "OpenSans" }}>
        Status: <IonLabel>{status}</IonLabel>
        <div
          style={{
            backgroundColor: `${color}`,
            border: "1px solid black",
            display: "inline",
            paddingLeft: "1em",
            paddingRight: "1em",
            float: "right",
          }}
        >
          &nbsp;
        </div>
        <br />
        Questions: <IonLabel>{q13.numQuestions}</IonLabel>
        <br />
      </IonCardContent>
    </IonCard>
  );
};
