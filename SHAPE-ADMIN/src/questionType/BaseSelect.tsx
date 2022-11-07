import {
    IonInput,
    IonLabel,
    IonText,
    IonList,
    IonItem,
    IonListHeader,
    IonIcon,
    IonReorderGroup,
    IonReorder,
    IonButton
} from '@ionic/react';
import React from 'react';
import { QuestionChoice } from '../interfaces/DataTypes';
import { addCircleOutline, reorderTwoOutline, trashOutline } from 'ionicons/icons';

interface ReduxProps {
    type: string;
    choices: Array<QuestionChoice>;
    displayChoices: any;
    addChoice: Function;
    doReorder: Function;
    handleChoiceValueChange: Function;
    handleChoiceTextChange: Function;
    deleteChoice: Function;
}

class BaseSelect extends React.Component<ReduxProps> {
    render() {
        let {
            choices,
            addChoice,
            doReorder,
            handleChoiceValueChange,
            handleChoiceTextChange,
            deleteChoice
        } = this.props;

        return (
            <IonList lines='full' class='ion-no-margin ion-no-padding'>
                <IonListHeader>
                    <IonItem lines='none'>
                        <IonLabel id='newQuestionChoice'>
                            Choices<IonText color='danger'>*</IonText>
                        </IonLabel>
                        <IonButton
                            aria-labelledby='newQuestionChoice'
                            color='dark'
                            onClick={() => addChoice()}>
                            <IonIcon
                                icon={addCircleOutline}
                                style={{
                                    cursor: 'pointer',
                                    verticalAlign: 'middle'
                                }}></IonIcon>
                        </IonButton>
                    </IonItem>
                </IonListHeader>
                <IonReorderGroup disabled={false} onIonItemReorder={(e: any) => doReorder(e)}>
                    {choices.map((choice: QuestionChoice, index: number) => {
                        return (
                            <IonItem lines='inset' key={choice.index}>
                                <IonLabel>
                                    Value
                                    <IonText color='danger'>*</IonText> &nbsp;
                                </IonLabel>
                                <IonInput
                                    value={choice.value}
                                    onBlur={(e) => handleChoiceValueChange(e, index)}></IonInput>
                                <IonLabel>
                                    Display Text
                                    <IonText color='danger'>*</IonText>
                                    &nbsp;
                                </IonLabel>
                                <IonInput
                                    value={choice.text}
                                    onBlur={(e) => handleChoiceTextChange(e, index)}></IonInput>
                                <IonButton fill='clear' color='medium' onClick={() => deleteChoice(index)}>
                                    <IonIcon
                                        slot='end'
                                        icon={trashOutline}
                                        style={{ cursor: 'pointer', fontSize: '24px' }}
                                    />
                                </IonButton>
                                <IonReorder slot='start'>
                                    <IonIcon icon={reorderTwoOutline} />
                                </IonReorder>
                            </IonItem>
                        );
                    })}
                </IonReorderGroup>
            </IonList>
        );
    }
}

export default BaseSelect;
