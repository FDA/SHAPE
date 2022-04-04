import { ReactNode } from "react";
import { QuestionnaireQuestion } from "../../interfaces/DataTypes";

export class BaseQuestionFactory {
  createJSX(
    question: QuestionnaireQuestion,
    valueEventHandler: Function,
    defaultValue: any,
    clearValue: Function,
    currentAnswerValue: Function
  ): ReactNode {
    throw new Error("Must override this function");
  }

  private _value: string = "";

  setValue(value: string) {
    this._value = value;
  }

  getValue(value: string) {
    return this._value;
  }
}
