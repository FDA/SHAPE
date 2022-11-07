import { BaseQuestionFactory } from './BaseQuestionFactory';
import React, { ReactNode } from 'react';
import { IonIcon, IonItem, IonLabel, IonRange } from '@ionic/react';
import { happyOutline, sadOutline } from 'ionicons/icons';
import { QuestionnaireQuestion } from '../../interfaces/DataTypes';
import { questionTypes } from '../../utils/Constants';

class SliderFactory extends BaseQuestionFactory {
    createJSX(question: QuestionnaireQuestion, valueEventHandler: Function, defaultValue: string): ReactNode {
        if (question.type !== questionTypes.SLIDER) return null;
        const val = Number(defaultValue);

        //@ts-ignore
        const { min, max, useFaces } = question.options;
        //@ts-ignore
        let { step } = question.options;
        const startIcon = useFaces ? (
            <IonIcon slot='start' icon={happyOutline} aria-label={'happy face icon'} />
        ) : null;
        const endIcon = useFaces ? (
            <IonIcon slot='end' icon={sadOutline} aria-label={'sad face icon'} />
        ) : null;
        if (!step) {
            step = 1;
        }
        return question.type === questionTypes.SLIDER ? (
            <IonItem className='question_item'>
                <p className='question_title'>{question.title}</p>
                <br />
                <p className='ion-text-wrap'>{question.text}</p>
                <IonLabel position='stacked'>{`Lower: ${min} Upper: ${max} Step: ${step}`}</IonLabel>
                <IonRange
                    id={question.name}
                    name={question.name}
                    value={val}
                    placeholder={question.placeholder}
                    min={min}
                    max={max}
                    snaps={true}
                    pin={true}
                    step={step}
                    onIonChange={(e) => valueEventHandler(e)}>
                    {startIcon}
                    {endIcon}
                </IonRange>
            </IonItem>
        ) : null;
    }
}

export default SliderFactory;
