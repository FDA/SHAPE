import {
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle
} from '@ionic/react';
import React from 'react';
import {routes} from '../utils/Constants';

const LoginCard: React.FC<any> = () => {
    return (
        <IonCard button={true} href={routes.LOGIN}>
            <IonCardHeader>
                <IonCardTitle>Login or Register</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
                In order to proceed, you must login or register first.
            </IonCardContent>
        </IonCard>
    );
};

export default LoginCard;
