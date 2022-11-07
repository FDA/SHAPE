import { BaseQuestionFactory } from './BaseQuestionFactory';
import { IonCheckbox, IonItem, IonLabel, IonList } from '@ionic/react';
import React, { ReactNode } from 'react';
import { RequiredDecorator } from '../components';
import { isEmptyObject } from '../../utils/Utils';
import { questionTypes } from '../../utils/Constants';
import { QuestionnaireQuestion, QuestionChoice } from '../../interfaces/DataTypes';

export default class CheckboxGroupFactory extends BaseQuestionFactory {
    state: Map<string, boolean>;
    valueEventHandler: Function = () => {
        return null;
    };

    constructor() {
        super();
        this.state = new Map();
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e: CustomEvent, questionName: string) {
        // @ts-ignore
        const isChecked = e.target.checked;
        // @ts-ignore
        const text = e.target.value;
        this.state.set(text, isChecked);

        // THIS NEEDS TO NOT BE AN ARRAY OF ARRAYS
        const retValue = Array.from(this.state);
        const checkedArr = retValue.filter((r: any) => r[1]);
        const toSave = checkedArr.map((n: any) => n[0]);

        const event = { target: { name: questionName, value: toSave } };
        this.valueEventHandler(event);
    }

    createJSX(question: QuestionnaireQuestion, valueEventHandler: Function, defaultValue: any): ReactNode {
        let hydratedChoices;
        const required = new RequiredDecorator();
        const r = required.decorate(question);
        this.state = new Map();

        for (const value in defaultValue) {
            this.state.set(defaultValue[value], true);
        }

        if (question.type === questionTypes.CHECKBOXGROUP) {
            this.valueEventHandler = valueEventHandler;
            hydratedChoices = question.choices
                ? question.choices.map((choice: QuestionChoice, i: number) => {
                      return (
                          <IonItem key={i}>
                              <IonLabel className='ion-text-wrap'>{choice.text}</IonLabel>
                              <IonCheckbox
                                  slot={'end'}
                                  id={choice.text}
                                  name={choice.text}
                                  value={`${choice.value}`}
                                  onIonChange={(e: CustomEvent<any>) => this.handleChange(e, question.name)}
                                  checked={
                                      !isEmptyObject(defaultValue)
                                          ? defaultValue.indexOf(choice.value) > -1
                                          : choice.isChecked
                                  }
                              />
                          </IonItem>
                      );
                  })
                : null;
        }

        return question.type === questionTypes.CHECKBOXGROUP ? (
            <IonList>
                <p className='question_title'>{question.title}</p>
                <IonItem>
                    <p className='ion-text-wrap'>
                        {r}
                        <br></br>
                        {question.text && <span>Instructions: {question.text} </span>}
                    </p>
                </IonItem>
                {hydratedChoices}
            </IonList>
        ) : null;
    }
}
