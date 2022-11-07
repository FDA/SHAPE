import { BaseQuestionFactory } from './BaseQuestionFactory';
import { IonItem, IonLabel } from '@ionic/react';
import React, { ReactNode } from 'react';
import { questionTypes } from '../../utils/Constants';
import { RequiredDecorator, CustomDateTime } from '../components';
import { QuestionnaireQuestion } from '../../interfaces/DataTypes';

export default class DateTimePickerFactory extends BaseQuestionFactory {
    createJSX(
        question: QuestionnaireQuestion,
        valueEventHandler: Function,
        defaultValue: string,
        clearValue: Function,
        currentAnswerValue: Function
    ): ReactNode {
        const required = new RequiredDecorator();
        const r = required.decorate(question);

        return question.type === questionTypes.DATETIME ? (
            <>
                <IonItem key={question.name} className='question_item' lines='none'>
                    <p className='question_title'>{question.title}</p>
                    <br />
                    <p className='ion-text-wrap'>
                        {r}
                        <br></br>
                        {question.text && <span>Instructions: {question.text} </span>}
                    </p>
                    <IonLabel className='ion-text-wrap' position='stacked' />
                </IonItem>
                <CustomDateTime
                    question={question}
                    valueEventHandler={valueEventHandler}
                    currentAnswerValue={currentAnswerValue}
                    clearValue={clearValue}
                />
            </>
        ) : null;
    }
}
