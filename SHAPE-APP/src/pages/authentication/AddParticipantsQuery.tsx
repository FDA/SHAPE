import React, { Component } from 'react';
import { IonContent, IonCard, IonCardContent, IonPage } from '@ionic/react';
import AppHeader from '../layout/AppHeader';
import { routes } from '../../utils/Constants';

interface PassedProps {}

interface PublicPrivateQueryState {}

class AddParticipantsQuery extends Component<PassedProps, PublicPrivateQueryState> {
    render = () => {
        return (
            <IonPage>
                <AppHeader showHeader={true} text={'Registration'} />
                <IonContent className='ion-padding'>
                    <IonCard button={true} routerLink={routes.REGISTER}>
                        <IonCardContent>I am registering on behalf of myself.</IonCardContent>
                    </IonCard>
                    <IonCard button={true} routerLink={routes.PARTICIPANT_ADD}>
                        <IonCardContent>I am registering on behalf of someone else.</IonCardContent>
                    </IonCard>
                </IonContent>
            </IonPage>
        );
    };
}

export default AddParticipantsQuery;
