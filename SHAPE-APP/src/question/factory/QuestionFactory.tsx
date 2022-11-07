import SingleLineTextFactory from "./SingleLineTextFactory";
import { ReactNode } from "react";
import RadioGroupFactory from "./RadioGroupFactory";
import CheckboxGroupFactory from "./CheckboxGroupFactory";
import DateTimePickerFactory from "./DateTimePickerFactory";
import SelectFactory from "./SelectFactory";
import SliderFactory from "./SliderFactory";
import TextAreaFactory from "./TextAreaFactory";
import RangeFactory from "./RangeFactory";
import InfoCardFactory from "./InfoCardFactory";
import { QuestionnaireQuestion } from "../../interfaces/DataTypes";

export default class QuestionFactory {
  questionFactories = [
    new SingleLineTextFactory(),
    new RadioGroupFactory(),
    new CheckboxGroupFactory(),
    new DateTimePickerFactory(),
    new SelectFactory(),
    new SliderFactory(),
    new TextAreaFactory(),
    new RangeFactory(),
    new InfoCardFactory(),
  ];

  renderQuestion(
    question: QuestionnaireQuestion,
    valueEventHandler: Function,
    defaultValue: string,
    clearValue: Function,
    getCurrentQuestionValue: Function
  ): ReactNode {
    let retVal = null;
    for (const qFactory of this.questionFactories) {
      const node = qFactory.createJSX(
        question,
        valueEventHandler,
        defaultValue,
        clearValue,
        getCurrentQuestionValue
      );
      if (node != null) {
        retVal = node;
        break;
      }
    }
    return retVal;
  }
}
