import React from 'react';
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonText } from '@ionic/react';

export const NoDataCard: React.FC<any> = ({ questionnaireView }) => {
    return (
        <IonCard style={{ textAlign: 'center' }}>
            <IonCardHeader>
                <IonCardTitle justify-content-center align-items-center>
                    {questionnaireView === 'todo' && <IonText>No Questionnaires</IonText>}
                    {questionnaireView === 'complete' && <IonText>No Questionnaires Completed</IonText>}
                </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
                {questionnaireView === 'todo' && (
                    <IonText>
                        There are currently no questionnaires for you to complete.<br></br>
                        <br></br>
                    </IonText>
                )}
                {questionnaireView === 'complete' && (
                    <IonText>
                        Once you respond to a questionnaire it will appear here.<br></br>
                        <br></br>
                    </IonText>
                )}
                Pull down on this card to refresh.
            </IonCardContent>
        </IonCard>
    );
};
