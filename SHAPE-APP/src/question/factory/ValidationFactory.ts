import { RequiredValidationEvaluator, RangeValidator } from "../components";
import { QuestionnaireQuestion } from "../../interfaces/DataTypes";
import { questionTypes } from "../../utils/Constants";

export default class ValidationFactory {
  validate(
    question: QuestionnaireQuestion,
    currentValue: string
  ): boolean {
    const retVal = true;

    if (question.hasOwnProperty("required")) {
      const validationEvaluator = new RequiredValidationEvaluator();
      const result = validationEvaluator.evaluate(
        question,
        currentValue
      );
      if (typeof result === "boolean") {
        if (!result) {
          return result;
        }
      }
    }

    //Question is not required
    if (question.type === questionTypes.RANGE) {
      const validationEvaluator = new RangeValidator();
      const result = validationEvaluator.evaluate(
        question,
        currentValue
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
