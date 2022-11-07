import React from 'react';
import { QuestionnaireQuestion } from '../../interfaces/DataTypes';

export class RequiredDecorator {
    public decorate(question: QuestionnaireQuestion) {
        if (question.required === true) {
            if (question.requiredMessage) return <span>Required question: {question.requiredMessage}</span>;
            return <span>This question is required</span>;
        }
        return <span></span>;
    }
}
