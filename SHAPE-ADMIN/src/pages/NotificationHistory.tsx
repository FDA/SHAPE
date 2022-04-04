import {
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonGrid,
    IonCol,
    IonRow,
    IonList,
    IonCard,
    IonCardContent,
    IonItem,
    IonIcon,
    IonFabButton
} from '@ionic/react';
import React from 'react';
import {isEmptyObject} from '../utils/Utils';
import {dateFormats} from '../utils/Constants';
import {withRouter, RouteComponentProps} from 'react-router-dom';
import {getNotifications} from '../utils/API';
import {compareDesc, format} from 'date-fns';
import Loading from '../layout/Loading';
import {arrowBackOutline} from 'ionicons/icons';
import {Message} from '../interfaces/DataTypes';

interface StateProps {
    messages: Array<Message>;
    isLoading: boolean;
    showDetails: boolean;
    selectedMessage: Message;
}

class NotificationHistory extends React.Component<
    RouteComponentProps,
    StateProps
> {
    constructor(props: RouteComponentProps) {
        super(props);
        this.state = {
            messages: [],
            isLoading: false,
            showDetails: false,
            selectedMessage: null
        };
    }

    UNSAFE_componentWillMount() {
        this.setState({isLoading: true});
        let parent = this;
        let messages: Array<Message> = [];
        getNotifications()
            .then(function (snapshot: any) {
                snapshot.forEach(function (doc: any) {
                    let message = doc.data;
                    messages.push(message);
                });
                parent.setState({messages: messages, isLoading: false});
            })
            .catch((err: any) => {
                console.error(err);
            });
    }

    render() {
        let {messages, isLoading, showDetails, selectedMessage} = this.state;

        messages = messages.sort((a: Message, b: Message) =>
            compareDesc(new Date(a.timestamp), new Date(b.timestamp))
        );

        return (
            <>
                {!showDetails && (
                    <IonPage>
                        <IonHeader>
                            <IonToolbar>
                                <IonButtons slot="start">
                                    <IonBackButton defaultHref="/home" />
                                </IonButtons>
                                <IonTitle>Sent Notifications</IonTitle>
                            </IonToolbar>
                        </IonHeader>
                        <IonContent>
                            <IonGrid>
                                <IonItem color="light">
                                    <IonCol size="2">Timestamp</IonCol>
                                    <IonCol size="2">Subject</IonCol>
                                    <IonCol size="5">Message</IonCol>
                                    <IonCol size="1">Email</IonCol>
                                    <IonCol size="1">SMS</IonCol>
                                    <IonCol size="1">In-App</IonCol>
                                </IonItem>
                                {isLoading && (
                                    <IonRow text-center>
                                        <IonCol
                                            size="12"
                                            style={{textAlign: 'center'}}>
                                            <Loading />
                                        </IonCol>
                                    </IonRow>
                                )}
                                {messages.map(
                                    (message: Message, index: number) => {
                                        return (
                                            <IonItem
                                                button
                                                onClick={() =>
                                                    this.setState({
                                                        showDetails: true,
                                                        selectedMessage: message
                                                    })
                                                }
                                                key={index}
                                                style={{
                                                    border:
                                                        '1px solid lightgrey'
                                                }}>
                                                <IonCol size="2">
                                                    {format(
                                                        new Date(
                                                            message.timestamp
                                                        ),
                                                        dateFormats.MMddyyZYYHHmmss
                                                    )}
                                                </IonCol>
                                                <IonCol size="2">
                                                    {message.subject}
                                                </IonCol>
                                                <IonCol size="5">
                                                    {message.message}
                                                </IonCol>
                                                <IonCol size="1">
                                                    {!isEmptyObject(
                                                        message.emailRecipients
                                                    )
                                                        ? 'Y'
                                                        : 'N'}
                                                </IonCol>
                                                <IonCol size="1">
                                                    {!isEmptyObject(
                                                        message.smsRecipients
                                                    )
                                                        ? 'Y'
                                                        : 'N'}
                                                </IonCol>
                                                <IonCol size="1">
                                                    {!isEmptyObject(
                                                        message.pushRecipients
                                                    )
                                                        ? 'Y'
                                                        : 'N'}
                                                </IonCol>
                                            </IonItem>
                                        );
                                    }
                                )}
                            </IonGrid>
                            {!isLoading && isEmptyObject(messages) && (
                                <IonCard style={{textAlign: 'center'}}>
                                    <IonCardContent>
                                        No notifications have been sent.
                                    </IonCardContent>
                                </IonCard>
                            )}
                        </IonContent>
                    </IonPage>
                )}
                {showDetails && (
                    <IonPage>
                        <IonHeader>
                            <IonToolbar>
                                <IonButtons slot="start">
                                    <IonFabButton
                                        size="small"
                                        color="clear"
                                        onClick={() => {
                                            this.setState({
                                                showDetails: false,
                                                selectedMessage: null
                                            });
                                        }}>
                                        <IonIcon icon={arrowBackOutline} />
                                    </IonFabButton>
                                </IonButtons>
                                <IonTitle>Return to List</IonTitle>
                            </IonToolbar>
                        </IonHeader>
                        <IonContent>
                            <IonGrid>
                                <IonItem color="light">
                                    <IonCol size="2">Timestamp</IonCol>
                                    <IonCol size="2">Subject</IonCol>
                                    <IonCol size="8">Message</IonCol>
                                </IonItem>
                                <IonItem
                                    style={{border: '1px solid lightgrey'}}>
                                    <IonCol size="2">
                                        {format(
                                            new Date(selectedMessage.timestamp),
                                            dateFormats.MMddyyZYYHHmmss
                                        )}
                                    </IonCol>
                                    <IonCol size="2">
                                        {selectedMessage.subject}
                                    </IonCol>
                                    <IonCol size="8">
                                        {selectedMessage.message}
                                    </IonCol>
                                </IonItem>
                                <IonItem color="light">
                                    <IonCol size="4">Email Recipients</IonCol>
                                    <IonCol size="4">SMS Recipients</IonCol>
                                    <IonCol size="4">
                                        In-App Message Recipients
                                    </IonCol>
                                </IonItem>
                                <IonItem>
                                    <IonCol size="4">
                                        <IonList>
                                            {selectedMessage.emailRecipients.map(
                                                (elem: string) => {
                                                    return (
                                                        <IonRow>{elem}</IonRow>
                                                    );
                                                }
                                            )}
                                        </IonList>
                                    </IonCol>
                                    <IonCol size="4">
                                        <IonList>
                                            {selectedMessage.smsRecipients.map(
                                                (elem: string) => {
                                                    return (
                                                        <IonRow>{elem}</IonRow>
                                                    );
                                                }
                                            )}
                                        </IonList>
                                    </IonCol>
                                    <IonCol size="4">
                                        <IonList>
                                            {selectedMessage.pushRecipients.map(
                                                (elem: string) => {
                                                    return (
                                                        <IonRow>{elem}</IonRow>
                                                    );
                                                }
                                            )}
                                        </IonList>
                                    </IonCol>
                                </IonItem>
                            </IonGrid>
                        </IonContent>
                    </IonPage>
                )}
            </>
        );
    }
}

export default withRouter(NotificationHistory);
