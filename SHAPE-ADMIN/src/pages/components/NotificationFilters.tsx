import React from 'react';
import {
    IonHeader,
    IonTitle,
    IonToolbar,
    IonLabel,
    IonList,
    IonItem,
    IonButton,
    IonRow,
    IonCol,
    IonSelect,
    IonSelectOption,
    IonRange,
    IonRadio,
    IonRadioGroup
} from '@ionic/react';
import { Survey, Questionnaire } from '../../interfaces/DataTypes';

interface Props {
    parent: React.Component;
    survey: Survey;
    questionnaire: Questionnaire;
    surveys: Array<Survey>;
    questionnaires: Array<Questionnaire>;
    age: { lower: number; upper: number };
    gender: { gender: string; operator: string; isDate: boolean };
    setSurvey: Function;
    setQuestionnaire: Function;
    setGender: Function;
    filterForRespondents: Function;
    setAge: Function;
    clearFilters: Function;
}

class NotificationFilters extends React.Component<Props, {}> {
    render() {
        const {
            parent,
            survey,
            setSurvey,
            surveys,
            questionnaire,
            setQuestionnaire,
            questionnaires,
            age,
            setAge,
            gender,
            setGender,
            filterForRespondents,
            clearFilters
        } = this.props;

        return (
            <>
                <IonHeader aria-label='Filter for Respondent(s)'>
                    <IonToolbar color='light'>
                        <IonTitle>Filter for Respondent(s)</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonRow>
                    <IonCol size='6'>
                        <IonList>
                            <IonItem>
                                <IonLabel id='selectSurvey'>Select Survey</IonLabel>
                                <IonSelect
                                    aria-labelledby='selectSurvey'
                                    value={survey}
                                    onIonChange={(e) => setSurvey(parent, e.detail.value)}>
                                    {surveys.map((s: Survey) => {
                                        return (
                                            <IonSelectOption key={s.id} value={s}>
                                                {s.name}
                                            </IonSelectOption>
                                        );
                                    })}
                                </IonSelect>
                            </IonItem>
                        </IonList>
                    </IonCol>
                    <IonCol size='6'>
                        <IonList>
                            <IonItem>
                                <IonLabel>Select Questionnaire</IonLabel>
                                <IonSelect
                                    value={questionnaire}
                                    onIonChange={(e) => setQuestionnaire(parent, e.detail.value)}>
                                    {questionnaires.map((q: Questionnaire, index: number) => {
                                        return (
                                            <IonSelectOption key={index} value={q}>
                                                {q.name}
                                            </IonSelectOption>
                                        );
                                    })}
                                </IonSelect>
                            </IonItem>
                        </IonList>
                    </IonCol>
                </IonRow>
                <IonRow>
                    <IonCol size='6'>
                        <IonList>
                            <IonLabel>&nbsp;&nbsp;Age</IonLabel>
                            <IonRange
                                aria-label='Age'
                                dualKnobs={true}
                                pin={true}
                                min={0}
                                max={100}
                                step={5}
                                snaps={true}
                                value={age}
                                onClick={(e: any) => setAge(parent, e.target.value)}
                            />
                        </IonList>
                    </IonCol>
                    <IonCol size='6'>
                        <IonList>
                            <IonLabel>&nbsp;&nbsp;Gender</IonLabel>
                            <IonRadioGroup
                                aria-owns='female male'
                                title='Gender'
                                value={gender.gender}
                                onClick={(e: any) => setGender(parent, e.target.value)}>
                                <IonList>
                                    <IonItem>
                                        <IonLabel>Female</IonLabel>
                                        <IonRadio id='female' slot='start' value='F' />
                                    </IonItem>
                                    <IonItem>
                                        <IonLabel>Male</IonLabel>
                                        <IonRadio id='male' slot='start' value='M' />
                                    </IonItem>
                                </IonList>
                            </IonRadioGroup>
                        </IonList>
                    </IonCol>
                </IonRow>
                <IonRow>
                    <IonCol size='6' class='ion-text-center'>
                        <IonButton
                            expand='full'
                            size='small'
                            color='primary'
                            onClick={() =>
                                filterForRespondents(parent, survey, questionnaire, age, gender, surveys)
                            }>
                            Filter for Matching Respondents
                        </IonButton>
                    </IonCol>
                    <IonCol size='6' class='ion-text-center'>
                        <IonButton
                            expand='full'
                            size='small'
                            color='secondary'
                            onClick={() => clearFilters(parent, surveys)}>
                            Clear Filter(s)
                        </IonButton>
                    </IonCol>
                </IonRow>
            </>
        );
    }
}

export default NotificationFilters;
