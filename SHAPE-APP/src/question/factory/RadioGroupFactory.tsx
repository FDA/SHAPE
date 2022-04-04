import React, { ReactNode } from "react";
import { BaseQuestionFactory } from "./BaseQuestionFactory";
import { IonItem, IonLabel, IonRadio, IonRadioGroup } from "@ionic/react";
import { RequiredDecorator } from "../components";
import {
  QuestionnaireQuestion,
  QuestionChoice,
} from "../../interfaces/DataTypes";
import { questionTypes } from "../../utils/Constants";

class RadioGroupFactory extends BaseQuestionFactory {
  createJSX(
    question: QuestionnaireQuestion,
    valueEventHandler: Function,
    defaultValue: string,
    clearValue: Function,
    currentAnswerValue: Function
  ): ReactNode {
    const required = new RequiredDecorator();
    const r = required.decorate(question);
    let choices;

    if (question.type === questionTypes.RADIOGROUP) {
      choices = question.choices
        ? question.choices.map((choice: QuestionChoice) => {
            return (
              <IonItem key={choice.value}>
                <IonLabel className="ion-text-wrap">{choice.text}</IonLabel>
                <IonRadio value={choice.value} mode={"md"} />
              </IonItem>
            );
          })
        : null;
    }

    return question.type === "radiogroup" ? (
      <>
        <IonRadioGroup
          className="question_item"
          id={question.name}
          name={question.name}
          key={question.name}
          onIonChange={(e) => valueEventHandler(e)}
          value={defaultValue}
          allowEmptySelection
        >
          <p className="question_title">{question.title}</p>
          <br />
          <p className="ion-text-wrap">
            {r} {question.text}
          </p>
          {choices}
        </IonRadioGroup>
      </>
    ) : null;
  }
}

export default RadioGroupFactory;
