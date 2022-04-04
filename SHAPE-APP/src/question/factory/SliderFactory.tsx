import { BaseQuestionFactory } from "./BaseQuestionFactory";
import React, { ReactNode } from "react";
import { IonIcon, IonItem, IonLabel, IonList, IonRange } from "@ionic/react";
import { happyOutline, sadOutline } from "ionicons/icons";
import { QuestionnaireQuestion } from "../../interfaces/DataTypes";
import { questionTypes } from "../../utils/Constants";

class SliderFactory extends BaseQuestionFactory {
  createJSX(
    question: QuestionnaireQuestion,
    valueEventHandler: Function,
    defaultValue: string,
    clearValue: Function,
    currentAnswerValue: Function
  ): ReactNode {
    if (question.type !== questionTypes.SLIDER) return null;
    const val = Number(defaultValue);
    //@ts-ignore
    let { min, max, step, useFaces } = question.options;
    const startIcon = useFaces ? (
      <IonIcon slot="start" icon={happyOutline} />
    ) : null;
    const endIcon = useFaces ? <IonIcon slot="end" icon={sadOutline} /> : null;
    if (!step) {
      step = 1;
    }
    return question.type === questionTypes.SLIDER ? (
      <IonList>
        <IonItem className="question_item">
          <p className="question_title">{question.title}</p>
          <br />
          <p className="ion-text-wrap">{question.text}</p>
          <IonLabel position="stacked">
            {`Lower: ${min} Upper: ${max} Step: ${step}`}
          </IonLabel>
          <IonRange
            id={question.name}
            name={question.name}
            value={val}
            placeholder={question.placeholder}
            min={min}
            max={max}
            snaps={true}
            pin={true}
            step={step}
            onIonChange={(e) => valueEventHandler(e)}
          >
            {startIcon}
            {endIcon}
          </IonRange>
        </IonItem>
      </IonList>
    ) : null;
  }
}

export default SliderFactory;
