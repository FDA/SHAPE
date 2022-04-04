import { BaseQuestionFactory } from "./BaseQuestionFactory";
import { IonCheckbox, IonItem, IonLabel, IonList } from "@ionic/react";
import React, { ReactNode } from "react";
import { RequiredDecorator } from "../components";
import { isEmptyObject } from "../../utils/Utils";
import { questionTypes } from "../../utils/Constants";
import {
  QuestionnaireQuestion,
  QuestionChoice,
} from "../../interfaces/DataTypes";

export default class CheckboxGroupFactory extends BaseQuestionFactory {
  state: Map<string, boolean>;
  valueEventHandler: Function = () => {
    return null;
  };

  constructor() {
    super();
    this.state = new Map();
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e: CustomEvent) {
    // @ts-ignore
    const id = e.target.id;
    // @ts-ignore
    const isChecked = e.target.checked;
    // @ts-ignore
    const text = e.target.value;
    this.state.set(text, isChecked);

    // THIS NEEDS TO NOT BE AN ARRAY OF ARRAYS
    let retValue = Array.from(this.state);
    let checkedArr = retValue.filter((r: any) => r[1]);
    let toSave = checkedArr.map((n: any) => n[0]);

    const event = { target: { name: id, value: toSave } };
    this.valueEventHandler(event);
  }

  createJSX(
    question: QuestionnaireQuestion,
    valueEventHandler: Function,
    defaultValue: any,
    clearValue: Function,
    currentAnswerValue: Function
  ): ReactNode {
    let hydratedChoices;
    const required = new RequiredDecorator();
    const r = required.decorate(question);
    this.state = new Map();

    for (let value in defaultValue) {
      this.state.set(defaultValue[value], true);
    }

    if (question.type === questionTypes.CHECKBOXGROUP) {
      this.valueEventHandler = valueEventHandler;
      hydratedChoices = question.choices
        ? question.choices.map((choice: QuestionChoice, i: number) => {
            return (
              <IonItem key={i}>
                <IonLabel className="ion-text-wrap">{choice.text}</IonLabel>
                <IonCheckbox
                  slot={"end"}
                  id={question.name}
                  name={choice.text}
                  value={`${choice.value}`}
                  onIonChange={(e: CustomEvent<any>) => this.handleChange(e)}
                  checked={
                    !isEmptyObject(defaultValue)
                      ? defaultValue.indexOf(choice.value) > -1
                      : choice.isChecked
                  }
                />
              </IonItem>
            );
          })
        : null;
    }

    return question.type === questionTypes.CHECKBOXGROUP ? (
      <IonList>
        <p className="question_title">{question.title}</p>
        <IonItem>
          <p className="ion-text-wrap">
            {r} {question.text}
          </p>
        </IonItem>
        {hydratedChoices}
      </IonList>
    ) : null;
  }
}
