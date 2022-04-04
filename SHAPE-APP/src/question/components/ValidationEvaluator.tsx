import {
  QuestionnaireQuestion,
  QuestionRule,
} from "../../interfaces/DataTypes";
import { Context } from "../engine/Context";

export interface ValidationEvaluator {
  evaluate(
    question: QuestionnaireQuestion,
    currentValue: string,
    context: Context | undefined,
    rule: QuestionRule | undefined
  ): boolean | undefined;
}
