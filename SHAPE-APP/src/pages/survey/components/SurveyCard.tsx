import React from 'react';
import { SurveyCard as SC, Questionnaire } from '../../../interfaces/DataTypes';
import {
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonFab,
    IonFabButton,
    IonLabel
} from '@ionic/react';
import { profilesWithNoCompletedResponse } from '../../../utils/Utils';

export const SurveyCard: React.FC<SC> = (survey: SC) => {
    const { questionnaires, participantResponse, profile } = survey;
    if (!questionnaires) {
        return null;
    }
    const correspondingQ13s = questionnaires.filter((q: Questionnaire) => q.surveyId === survey.id);

    const numberOfQ13sTodo = correspondingQ13s
        .filter((q: Questionnaire) => {
            return q.open !== undefined && q.open === true;
        })
        .filter((q: Questionnaire) => {
            return profilesWithNoCompletedResponse(q.id, participantResponse, profile).length > 0;
        }).length;

    return (
        <div>
            {numberOfQ13sTodo > 0 && (
                <IonFab vertical='top' horizontal='end' slot='fixed'>
                    <IonFabButton
                        size='small'
                        role={'link'}
                        aria-label={`number of questionnaires open is ${numberOfQ13sTodo}`}
                        onClick={(e) => survey.onClick(e)}
                        color='danger'>
                        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{numberOfQ13sTodo}</div>
                    </IonFabButton>
                </IonFab>
            )}
            <IonCard button={true} onClick={(e) => survey.onClick(e)}>
                <IonCardHeader>
                    <IonCardTitle>{survey.name}</IonCardTitle>
                    <IonCardSubtitle>{survey.shortDescription}</IonCardSubtitle>
                </IonCardHeader>
                <IonCardContent>{survey.description}</IonCardContent>
                <IonCardContent style={{ fontFamily: 'OpenSans' }}>
                    Questionnaires: <IonLabel>{correspondingQ13s.length}</IonLabel>
                </IonCardContent>
            </IonCard>
        </div>
    );
};
