import { Rules } from "../factory/RuleFactory";
import { Context } from "../engine/Context";
import { Rule } from "js-rules-engine";
import {
  QuestionnaireQuestion,
  QuestionRule,
} from "../../interfaces/DataTypes";

export class RuleLogicEvaluator implements Rules {
  evaluate(
    question: QuestionnaireQuestion,
    currentValue: string,
    context: Context,
    rule: any
  ): boolean {
    const profile = context.profile;
    let retVal = false;

    let ruleJson = formatRule(rule);
    const ruleInstance = new Rule(ruleJson);
    let formattedCurVal = formatCurrentVal(currentValue);

    let fact = {
      currentValue: formattedCurVal,
      profile: profile,
      question: question,
    };

    let factsArr = rule.expression.entries.map((entry: any) => entry.fact);

    if (rule && factsArr.includes("profile.age") && context) {
      let age = getAge(context.profile.dob);
      fact.profile.age = age;
    }

    retVal = ruleInstance.evaluate(fact);
    return retVal;
  }
}

const formatCurrentVal = (currentValue: string) => {
  let result = currentValue;

  if (Array.isArray(currentValue)) {
    let first = currentValue[0];
    if (first.hasOwnProperty("isChecked")) {
      let temp = currentValue.find((obj) => obj.isChecked === true);
      if (temp) result = temp.value;
    }
  }

  return result;
};

const formatRule = (rule: QuestionRule) => {
  return {
    [rule.ruleType]: [...rule.expression.entries],
  };
};

const getAge = (dob: string) => {
  let birthDate = new Date(dob);
  let today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  let m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};
