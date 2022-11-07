import { BaseQuestionFactory } from './BaseQuestionFactory';
import React, { ReactNode } from 'react';
import { IonInput, IonItem, IonLabel, IonText } from '@ionic/react';
import { RequiredDecorator } from '../components';
import { QuestionnaireQuestion } from '../../interfaces/DataTypes';
import { questionTypes } from '../../utils/Constants';

class RangeFactory extends BaseQuestionFactory {
    createJSX(question: QuestionnaireQuestion, valueEventHandler: Function, defaultValue: string): ReactNode {
        const required = new RequiredDecorator();
        const r = required.decorate(question);

        return question.type === questionTypes.RANGE ? (
            <IonItem key={question.name}>
                <p className='question_title'>{question.title}</p>
                <br />
                <IonText color='primary'>
                    Only number values are valid, min value: {question.min} max value: {question.max}
                </IonText>
                <p className='ion-text-wrap'>
                    {r}
                    <br></br>
                    {question.text && <span>Instructions: {question.text} </span>}
                </p>
                <IonLabel className='ion-text-wrap' position='stacked'>
                    Answer:&nbsp;
                </IonLabel>
                <IonInput
                    name={question.name}
                    type='number'
                    inputMode='numeric'
                    min={question.min}
                    max={question.max}
                    required={question.required}
                    placeholder={question.placeholder}
                    onIonChange={(e) => valueEventHandler(e)}
                    value={defaultValue}
                    clearOnEdit={true}
                />
            </IonItem>
        ) : null;
    }
}

export default RangeFactory;
