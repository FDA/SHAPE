import { Context } from "./question/engine/Context";
import { RuleLogicEvaluator } from "./RuleLogicEvaluator";
import { QuestionnaireQuestion } from "./interfaces/DataTypes";

export interface Rules {
    evaluate: any;
}

export default class RuleFactory {
    ruleFactories = [new RuleLogicEvaluator()];

    evaluateRules(question: QuestionnaireQuestion, currentValue: string, context: Context): string {
        let retVal = "";
        for (const rFactory of this.ruleFactories) {
            const { rules } = question;
            if (rules) {
                for (const rule of rules) {
                    const isEqual = rFactory.evaluate(question, currentValue, context, rule);
                    if (isEqual) {
                        retVal = rule.addTo ? rule.addTo : "";
                        break;
                    }
                }
            }
        }
        return retVal;
    }
}
