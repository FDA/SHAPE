import { BaseQuestionFactory } from "./BaseQuestionFactory";
import { IonInput, IonItem, IonLabel } from "@ionic/react";
import React, { ReactNode } from "react";
import { RequiredDecorator } from "../components";
import { QuestionnaireQuestion } from "../../interfaces/DataTypes";
import { questionTypes } from "../../utils/Constants";

export default class SingleLineTextFactory extends BaseQuestionFactory {
  createJSX(
    question: QuestionnaireQuestion,
    valueEventHandler: Function,
    defaultValue: string,
    clearValue: Function,
    currentAnswerValue: Function
  ): ReactNode {
    const required = new RequiredDecorator();
    const r = required.decorate(question);

    return question.type === questionTypes.SINGLETEXT ? (
      <IonItem key={question.name} className="question_item">
        <p className="question_title">{question.title}</p>
        <br />
        <p className="ion-text-wrap">
          {r} {question.text}
        </p>
        <IonLabel className="ion-text-wrap" position="stacked">
          &nbsp;
        </IonLabel>
        <IonInput
          name={question.name}
          required={question.required}
          placeholder={question.placeholder}
          onIonChange={(e) => valueEventHandler(e)}
          value={defaultValue}
        />
      </IonItem>
    ) : null;
  }
}
