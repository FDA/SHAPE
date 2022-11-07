import { ValidationEvaluator } from './ValidationEvaluator';
import { QuestionnaireQuestion } from '../../interfaces/DataTypes';
import { questionTypes } from '../../utils/Constants';
import { isEmptyObject } from '../../utils/Utils';

export class RangeValidator implements ValidationEvaluator {
    evaluate(question: QuestionnaireQuestion, currentValue: string): boolean | undefined {
        if (question.type === questionTypes.RANGE) {
            if (isEmptyObject(currentValue)) {
                return true;
            }

            const numCurrentVal = Number(currentValue);

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
