import React from "react";
import { SurveyCard as SC, Questionnaire } from "../../../interfaces/DataTypes";
import ChartCanvasContainer from "../../charting/containers/ChartCanvasContainer";
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonLabel,
} from "@ionic/react";
import { ColoredLine } from "./";

export const SurveyCard: React.FC<SC> = (survey: SC) => {
  const { questionnaires } = survey;
  if (!questionnaires) {
    return null;
  }
  let correspondingQs = questionnaires.filter(
    (q: Questionnaire) => q.surveyId === survey.id
  );
  return (
    <IonCard button={true} onClick={(e) => survey.onClick(e)}>
      <IonCardHeader>
        <IonCardTitle>{survey.name}</IonCardTitle>
        <IonCardSubtitle>{survey.shortDescription}</IonCardSubtitle>
      </IonCardHeader>
      <IonCardContent>{survey.description}</IonCardContent>
      <ColoredLine />
      <IonCardContent>
        Status: <IonLabel>{survey.status ? "Open" : "Closed"}</IonLabel>
        <br />
        Questionnaires: <IonLabel>{correspondingQs.length}</IonLabel>
      </IonCardContent>
      <ChartCanvasContainer questionnaires={correspondingQs} />
    </IonCard>
  );
};
