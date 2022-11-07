import React from 'react';
import { routes } from '../../../utils/Constants';
import { IonButton } from '@ionic/react';

export const ButtonBar: React.FC<{}> = () => {
    return (
        <span>
            <IonButton
                type='submit'
                id='login-button'
                style={{ marginTop: '.5em' }}
                expand='block'
                color='primary'>
                Login
            </IonButton>
            <IonButton
                type='button'
                routerLink={routes.LOGIN_CARD}
                style={{ marginTop: '.5em' }}
                expand='block'
                fill='solid'
                color='light'>
                Cancel
            </IonButton>
            <IonButton
                type='button'
                routerLink={routes.PASSWORD_RESET}
                style={{ marginTop: '1.5em' }}
                expand='block'
                fill='solid'
                color='light'>
                Reset Password
            </IonButton>
        </span>
    );
};
