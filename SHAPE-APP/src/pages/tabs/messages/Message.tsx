import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import {
    IonToolbar,
    IonButton,
    IonCardSubtitle,
    IonCardTitle,
    IonModal,
    IonContent,
    IonHeader,
    IonTitle,
    IonButtons,
    IonItem,
    IonLabel
} from '@ionic/react';
import { User, Inbox, FirebaseAuth } from '../../../interfaces/DataTypes';
import { routes } from '../../../utils/Constants';
import { ColoredLine } from '../../survey/components';
import { format } from 'date-fns';

interface PassedProps {
    profile: User;
    loadParticipantInbox: Function;
    message: Inbox;
    deleteMessage: Function;
    closeMessage: Function;
    fireBaseAuth: FirebaseAuth;
    showMessage: boolean;
    router: HTMLElement;
}

class Message extends Component<PassedProps, {}> {
    deleteMessage = () => {
        const { message, deleteMessage, closeMessage } = this.props;
        const messageId = message.id;

        deleteMessage(messageId);
        closeMessage();
    };

    render() {
        const { message, fireBaseAuth, closeMessage, showMessage, router } = this.props;
        const { isEmpty } = fireBaseAuth;

        if (isEmpty) return <Redirect to={routes.LOGIN} />;

        return (
            <IonModal
                isOpen={showMessage}
                swipeToClose={false}
                presentingElement={router || undefined}
                onDidDismiss={() => closeMessage()}>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>
                            <strong>Inbox Message</strong>
                        </IonTitle>
                        <IonButtons slot='start'>
                            <IonButton color='primary' type='button' onClick={() => closeMessage()}>
                                Cancel
                            </IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>

                <IonContent className='ion-padding'>
                    <IonHeader className='ion-padding-bottom'>
                        <IonCardTitle>{message.subject}</IonCardTitle>
                        <ColoredLine></ColoredLine>
                        {message.timestamp && (
                            <IonCardSubtitle>{format(new Date(message.timestamp), 'PP pp')}</IonCardSubtitle>
                        )}
                    </IonHeader>
                    <IonItem className='ion-margin-bottom' color='light' lines={'none'}>
                        <IonLabel tabIndex={1} className='ion-padding-horizontal ion-text-wrap'>
                            {message.message}
                        </IonLabel>
                    </IonItem>
                    <IonButton
                        type='button'
                        onClick={() => this.deleteMessage()}
                        expand='block'
                        fill='solid'
                        color='danger'>
                        Delete
                    </IonButton>
                </IonContent>
            </IonModal>
        );
    }
}

export default Message;
