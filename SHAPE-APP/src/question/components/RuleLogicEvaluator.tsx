import { Rules } from '../factory/RuleFactory';
import { Context } from '../engine/Context';
import { Rule } from 'js-rules-engine';
import { QuestionnaireQuestion, QuestionRule } from '../../interfaces/DataTypes';
import { format } from 'date-fns';
import { questionTypes, dateFormats } from '../../utils/Constants';

export class RuleLogicEvaluator implements Rules {
    evaluate(question: QuestionnaireQuestion, currentValue: string, context: Context, rule: any): boolean {
        const profile = context.profile;
        let retVal = false;

        const ruleJson = formatRule(rule);
        const ruleInstance = new Rule(ruleJson);
        const formattedCurVal = formatCurrentVal(question, currentValue);

        const fact = {
            currentValue: formattedCurVal,
            profile: profile,
            question: question
        };

        const factsArr = rule.expression.entries.map((entry: any) => entry.fact);

        if (rule && factsArr.includes('profile.age') && context) {
            const age = getAge(context.profile.dob);
            fact.profile.age = age;
        }

        retVal = ruleInstance.evaluate(fact);
        return retVal;
    }
}

const formatCurrentVal = (question: any, currentValue: any) => {
    let result = currentValue;

    if (Array.isArray(currentValue)) {
        const first = currentValue[0];
        if (first.hasOwnProperty('isChecked')) {
            const temp = currentValue.find((obj) => obj.isChecked === true);
            if (temp) result = temp.value.toLowerCase();
        } else if (currentValue.length === 1) {
            result = first.toLowerCase();
        } else if (currentValue.length > 1) {
            result = currentValue.map((elem) => {
                return elem.toLowerCase();
            });
        }
    } else if (question.type === questionTypes.DATETIME) {
        if (currentValue) {
            result = format(new Date(currentValue), dateFormats.yyyyMMdd);
        }
    } else if (typeof result === 'string') {
        result = result.toLowerCase();
    }
    return result;
};

const formatRule = (rule: QuestionRule) => {
    const lowerCaseRules = [...rule.expression.entries].map((r) => {
        if (typeof r.value === 'string' && r.fact !== 'profile.gender') {
            r.value = r.value.toLowerCase();
        }
        return r;
    });
    return {
        [rule.ruleType]: lowerCaseRules
    };
};

const getAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};
