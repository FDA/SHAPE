import { BaseQuestionFactory } from "./BaseQuestionFactory";
import { IonItem, IonLabel, IonTextarea } from "@ionic/react";
import React, { ReactNode } from "react";
import { RequiredDecorator } from "../components";
import { QuestionnaireQuestion } from "../../interfaces/DataTypes";
import { questionTypes } from "../../utils/Constants";

export default class TextAreaFactory extends BaseQuestionFactory {
  createJSX(
    question: QuestionnaireQuestion,
    valueEventHandler: Function,
    defaultValue: string,
    clearValue: Function,
    currentAnswerValue: Function
  ): ReactNode {
    if (question.type !== questionTypes.TEXTAREA) return null;
    const required = new RequiredDecorator();
    const r = required.decorate(question);

    return question.type === questionTypes.TEXTAREA ? (
      <IonItem key={question.name} className="question_item">
        <p className="question_title">{question.title}</p>
        <br />
        <p className="ion-text-wrap">
          {r} {question.text}
        </p>
        <IonLabel className="ion-text-wrap" position="stacked">
          &nbsp;
        </IonLabel>
        <p>
          <IonTextarea
            name={question.name}
            required={question.required}
            placeholder={question.placeholder}
            onIonChange={(e) => valueEventHandler(e)}
            value={defaultValue}
            autoGrow={true}
            rows={10}
            cols={20}
            style={{
              paddingTop: "2px",
            }}
          />
        </p>
      </IonItem>
    ) : null;
  }
}
