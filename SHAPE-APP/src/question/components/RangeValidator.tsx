import { ValidationEvaluator } from "./ValidationEvaluator";
import { Context } from "../engine/Context";
import { QuestionnaireQuestion } from "../../interfaces/DataTypes";
import { questionTypes } from "../../utils/Constants";

export class RangeValidator implements ValidationEvaluator {
  evaluate(
    question: QuestionnaireQuestion,
    currentValue: string,
    context: Context | undefined
  ): boolean | undefined {
    if (question.type === questionTypes.RANGE) {
      const numCurrentVal = Number(currentValue);
      if (isNaN(numCurrentVal)) {
        return false;
      }
      try {
        const numMin = Number(question.min);
        const numMax = Number(question.max);
        if (numCurrentVal >= numMin && numCurrentVal <= numMax) {
          return true;
        } else {
          return false;
        }
      } catch (e) {
        console.error(e);
        return false;
      }
    }
  }
}
