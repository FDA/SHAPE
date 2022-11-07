import React from 'react';
import { IonItem, IonLabel, IonSelect, IonSelectOption } from '@ionic/react';
import { RequiredDecorator } from '.';
import { QuestionnaireQuestion, QuestionChoice } from '../../interfaces/DataTypes';

interface PassedProps {
    question: QuestionnaireQuestion;
    defaultValue: any;
    valueEventHandler: Function;
}

interface CustomSelectState {
    selected: Array<QuestionChoice>;
}

export class CustomSelect extends React.Component<PassedProps, CustomSelectState> {
    constructor(props: PassedProps) {
        super(props);
        this.state = {
            selected: []
        };
    }

    render() {
        const { question, defaultValue, valueEventHandler } = this.props;
        let choices: Array<any> = [];

        const required = new RequiredDecorator();
        const r = required.decorate(question);

        choices = question.choices
            ? question.choices.map((choice: QuestionChoice) => {
                  return (
                      <IonSelectOption key={choice.value} id={question.name} value={choice.value}>
                          {choice.text}
                      </IonSelectOption>
                  );
              })
            : [];

        return (
            <IonItem className='question_item'>
                <p className='question_title'>{question.title}</p>
                <br />
                <p className='ion-text-wrap'>
                    {r} {question.text}
                </p>
                <IonLabel className='ion-text-wrap' position='stacked'>
                    Select Answer: &nbsp;
                </IonLabel>
                <IonSelect
                    id={question.name}
                    name={question.name}
                    value={defaultValue}
                    placeholder={question.placeholder}
                    onIonChange={(e) => valueEventHandler(e)}>
                    {choices}
                </IonSelect>
            </IonItem>
        );
    }
}
