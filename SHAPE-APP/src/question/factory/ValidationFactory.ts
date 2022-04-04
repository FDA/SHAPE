import { RequiredValidationEvaluator, RangeValidator } from "../components";
import { Context } from "../engine/Context";
import { QuestionnaireQuestion } from "../../interfaces/DataTypes";
import { questionTypes } from "../../utils/Constants";

export default class ValidationFactory {
  validate(
    question: QuestionnaireQuestion,
    currentValue: string,
    context: Context | undefined
  ): boolean {
    let retVal = true;

    if (question.hasOwnProperty("required")) {
      const validationEvaluator = new RequiredValidationEvaluator();
      const result = validationEvaluator.evaluate(
        question,
        currentValue,
        context
      );
      if (typeof result === "boolean") {
        if (!result) {
          return result;
        }
      }
    }

    if (question.type === questionTypes.RANGE) {
      const validationEvaluator = new RangeValidator();
      const result = validationEvaluator.evaluate(
        question,
        currentValue,
        context
      );
      if (typeof result === "boolean") {
        if (!result) {
          return result;
        }
      }
    }

    return retVal;
  }
}
