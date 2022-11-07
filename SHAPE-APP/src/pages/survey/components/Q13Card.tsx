import React from 'react';
import { Q13Card as Q13 } from '../../../interfaces/DataTypes';
import {
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonFab,
    IonFabButton,
    IonIcon,
    IonLabel
} from '@ionic/react';
import { profilesWithNoCompletedResponse } from '../../../utils/Utils';
import { lockClosed } from 'ionicons/icons';

export const Q13Card: React.FC<Q13> = (props) => {
    const {
        id,
        participantResponse,
        href,
        name,
        shortDescription,
        description,
        numQuestions,
        profile,
        questionnaireView
    } = props;

    const numberTodo = profilesWithNoCompletedResponse(id, participantResponse, profile).length;

    return (
        <div>
            {numberTodo > 0 && questionnaireView === 'todo' && (
                <IonFab vertical='top' horizontal='end' slot='fixed'>
                    <IonFabButton size='small' routerLink={href} color='danger'>
                        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{numberTodo}</div>
                    </IonFabButton>
                </IonFab>
            )}
            {questionnaireView === 'complete' && (
                <IonFab vertical='top' horizontal='end' slot='fixed'>
                    <IonFabButton size='small' routerLink={href} color='none'>
                        <IonIcon icon={lockClosed} aria-label={'locked icon'} />
                    </IonFabButton>
                </IonFab>
            )}
            <IonCard button routerLink={href}>
                <IonCardHeader>
                    <IonCardTitle>{name}</IonCardTitle>
                    <IonCardSubtitle>{shortDescription}</IonCardSubtitle>
                </IonCardHeader>
                <IonCardContent>{description}</IonCardContent>
                <IonCardContent style={{ fontFamily: 'OpenSans' }}>
                    Questions: <IonLabel>{numQuestions}</IonLabel>
                </IonCardContent>
            </IonCard>
        </div>
    );
};
