import { BaseQuestionFactory } from "./BaseQuestionFactory";
import { IonItem, IonLabel, IonIcon } from "@ionic/react";
import React, { ReactNode } from "react";
import { dateFormats, questionTypes } from "../../utils/Constants";
import { calendarSharp } from "ionicons/icons";
import { RequiredDecorator, CustomDateTime } from "../components";
import { QuestionnaireQuestion } from "../../interfaces/DataTypes";

export default class DateTimePickerFactory extends BaseQuestionFactory {
  createJSX(
    question: QuestionnaireQuestion,
    valueEventHandler: Function,
    defaultValue: string,
    clearValue: Function,
    currentAnswerValue: Function
  ): ReactNode {
    let format = dateFormats.MMMDDYYYY;
    const required = new RequiredDecorator();
    const r = required.decorate(question);

    return question.type === questionTypes.DATETIME ? (
      <IonItem key={question.name} className="question_item">
        <p className="question_title">{question.title}</p>
        <p className="ion-text-wrap">
          {r} {question.text}
        </p>
        <IonLabel className="ion-text-wrap" position="stacked">
          &nbsp;
        </IonLabel>
        <IonIcon icon={calendarSharp} />
        <CustomDateTime
          question={question}
          valueEventHandler={valueEventHandler}
          defaultValue={defaultValue}
          clearValue={clearValue}
          currentAnswerValue={currentAnswerValue}
          format={format}
        />
      </IonItem>
    ) : null;
  }
}
