import { ValidationEvaluator } from "./ValidationEvaluator";
import { Context } from "../engine/Context";
import { QuestionnaireQuestion } from "../../interfaces/DataTypes";
import { questionTypes } from "../../utils/Constants";

export class RequiredValidationEvaluator implements ValidationEvaluator {
  evaluate(
    question: QuestionnaireQuestion,
    currentValue: string,
    context: Context | undefined
  ): boolean | undefined {
    let retVal = undefined;

    if (!question.hasOwnProperty("required")) return retVal;

    const { required } = question;

    if (!required) return retVal;

    if (currentValue === undefined || currentValue === null) {
      return false;
    }

    if (
      [
        questionTypes.SINGLETEXT,
        questionTypes.TEXTAREA,
        questionTypes.RANGE,
        questionTypes.DATETIME,
        questionTypes.SLIDER,
      ].includes(question.type) &&
      currentValue.length === 0
    )
      return false;

    if (
      [
        questionTypes.CHECKBOXGROUP,
        questionTypes.DROPDOWNGROUP,
        questionTypes.RADIOGROUP,
      ].includes(question.type)
    ) {
      // checkbox group, currentValue is an array of choices.
      // make sure one is checked.

      if (currentValue && Array.isArray(currentValue)) {
        return currentValue.length > 0;
      }
    }
    retVal = true;

    return retVal;
  }
}
