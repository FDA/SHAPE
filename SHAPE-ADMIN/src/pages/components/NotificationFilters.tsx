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
import {Survey, Questionnaire} from '../../interfaces/DataTypes';

interface Props {
    survey: Survey;
    questionnaire: Questionnaire;
    surveys: Array<Survey>;
    questionnaires: Array<Questionnaire>;
    age: {lower: number; upper: number};
    gender: {gender: string; operator: string; isDate: boolean};
    setSurvey: Function;
    setQuestionnaire: Function;
    setGender: Function;
    filterForRespondents: Function;
    clearFilter: Function;
    setAge: Function;
    clearFilters: Function;
}

class NotificationFilters extends React.Component<Props, {}> {
    render() {
        const {
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
                <IonHeader>
                    <IonToolbar color="light">
                        <IonTitle>Filter for Respondent(s)</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonRow>
                    <IonCol size="6">
                        <IonList>
                            <IonItem>
                                <IonLabel>
                                    <IonRow>
                                        <IonCol size="4">Select Survey</IonCol>
                                    </IonRow>
                                </IonLabel>
                                <IonSelect
                                    value={survey}
                                    onIonChange={(e) =>
                                        setSurvey(e.detail.value)
                                    }>
                                    {surveys.map((s: Survey) => {
                                        return (
                                            <IonSelectOption
                                                key={s.id}
                                                value={s}>
                                                {s.name}
                                            </IonSelectOption>
                                        );
                                    })}
                                </IonSelect>
                            </IonItem>
                        </IonList>
                    </IonCol>
                    <IonCol size="6">
                        <IonList>
                            <IonItem>
                                <IonLabel>
                                    <IonRow>
                                        <IonCol size="4">
                                            Select Questionnaire
                                        </IonCol>
                                    </IonRow>
                                </IonLabel>
                                <IonSelect
                                    value={questionnaire}
                                    onIonChange={(e) =>
                                        setQuestionnaire(e.detail.value)
                                    }>
                                    {questionnaires.map(
                                        (q: Questionnaire, index: number) => {
                                            return (
                                                <IonSelectOption
                                                    key={index}
                                                    value={q}>
                                                    {q.name}
                                                </IonSelectOption>
                                            );
                                        }
                                    )}
                                </IonSelect>
                            </IonItem>
                        </IonList>
                    </IonCol>
                </IonRow>
                <IonRow>
                    <IonCol size="6">
                        <IonList>
                            <IonLabel>
                                <IonRow>
                                    <IonCol size="6">Age</IonCol>
                                </IonRow>
                            </IonLabel>
                            <IonRange
                                dualKnobs={true}
                                pin={true}
                                min={0}
                                max={100}
                                step={5}
                                snaps={true}
                                value={age}
                                onClick={(e: any) => setAge(e.target.value)}
                            />
                        </IonList>
                    </IonCol>
                    <IonCol size="6">
                        <IonList>
                            <IonLabel>
                                <IonRow>
                                    <IonCol size="6">Gender</IonCol>
                                </IonRow>
                            </IonLabel>
                            <IonRadioGroup
                                value={gender.gender}
                                onClick={(e: any) => setGender(e.target.value)}>
                                <IonItem>
                                    <IonLabel>Female</IonLabel>
                                    <IonRadio slot="start" value="F" />
                                </IonItem>
                                <IonItem>
                                    <IonLabel>Male</IonLabel>
                                    <IonRadio slot="start" value="M" />
                                </IonItem>
                            </IonRadioGroup>
                        </IonList>
                    </IonCol>
                </IonRow>
                <IonRow>
                    <IonCol size="6" class="ion-text-center">
                        <IonButton
                            expand="full"
                            size="small"
                            color="primary"
                            onClick={() => filterForRespondents()}>
                            Filter for Matching Respondents
                        </IonButton>
                    </IonCol>
                    <IonCol size="6" class="ion-text-center">
                        <IonButton
                            expand="full"
                            size="small"
                            color="secondary"
                            onClick={() => clearFilters()}>
                            Clear Filter(s)
                        </IonButton>
                    </IonCol>
                </IonRow>
            </>
        );
    }
}

export default NotificationFilters;
