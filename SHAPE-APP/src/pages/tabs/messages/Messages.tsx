import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import {
    IonContent,
    IonPage,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonCardTitle,
    IonRefresherContent,
    IonRefresher
} from '@ionic/react';
import { isEmptyObject } from '../../../utils/Utils';
import { compareDesc } from 'date-fns';
import AppHeader from '../../layout/AppHeader';
import MessageContainer from './containers/MessageContainer';
import Loading from '../../layout/Loading';
import { RefresherEventDetail } from '@ionic/core/components';
import { Inbox, User, FirebaseAuth } from '../../../interfaces/DataTypes';
import { routes } from '../../../utils/Constants';
import ItemList from '../../components/ItemList';

interface PassedProps {
    profile: User;
    loadParticipantInbox: Function;
    markAsRead: Function;
    fireBaseAuth: FirebaseAuth;
    refreshAll: Function;
    inbox: Array<Inbox>;
    isLoading: boolean;
}

interface MessagesState {
    showMessage: boolean;
    message: Inbox;
}

class Messages extends Component<PassedProps, MessagesState> {
    routerRef: any;

    constructor(props: PassedProps) {
        super(props);

        this.state = {
            showMessage: false,
            message: {
                id: '0',
                message: 'Error fetching message',
                read: true,
                subject: 'Error fetching message',
                timestamp: '',
                userId: '',
                participantId: '',
                org: ''
            }
        };
    }

    UNSAFE_componentWillMount() {
        this.props.loadParticipantInbox();
    }

    openMessage = (message: Inbox) => {
        const { markAsRead } = this.props;

        const messageId = message.id;
        if (message.read !== true) {
            markAsRead(messageId);
        }

        this.setState({ showMessage: true, message: message });
    };

    closeMessage = () => {
        this.setState({
            showMessage: false,
            message: {
                id: '0',
                message: 'Error fetching message',
                read: true,
                subject: 'Error fetching message',
                timestamp: '',
                userId: '',
                participantId: '',
                org: ''
            }
        });
    };

    getStyle = (read: boolean) => {
        if (read) return 'light';
        else return '';
    };

    refreshState = (event: CustomEvent<RefresherEventDetail>) => {
        this.props.refreshAll();
        setTimeout(() => {
            event.detail.complete();
        }, 500);
    };

    setRouterRef = (element: any) => {
        this.routerRef = element;
    };

    render() {
        const { inbox, fireBaseAuth, isLoading } = this.props;
        const { isEmpty } = fireBaseAuth;
        const { showMessage, message } = this.state;

        if (isEmpty) return <Redirect to={routes.LOGIN} />;

        const sortedInbox = [...inbox].sort((a: Inbox, b: Inbox) =>
            compareDesc(new Date(a.timestamp), new Date(b.timestamp)) === 1 ? 1 : -1
        );

        return (
            <IonPage ref={this.setRouterRef}>
                <AppHeader showHeader={!isEmpty} text={'Messages'} />
                <IonContent>
                    {isLoading && <Loading />}
                    {isEmptyObject(inbox) ? (
                        <IonCard style={{ textAlign: 'center' }}>
                            <IonCardHeader>
                                <IonCardTitle>No Messages Currently Available</IonCardTitle>
                            </IonCardHeader>
                            <IonCardContent>Check back later!</IonCardContent>
                        </IonCard>
                    ) : (
                        <>
                            <IonRefresher
                                slot='fixed'
                                onIonRefresh={this.refreshState}
                                pullFactor={0.5}
                                pullMin={100}
                                pullMax={200}>
                                <IonRefresherContent />
                            </IonRefresher>
                            <ItemList data={sortedInbox} clickEvent={this.openMessage} showUnread />
                            <MessageContainer
                                message={message}
                                showMessage={showMessage}
                                closeMessage={this.closeMessage}
                                router={this.routerRef}
                            />
                        </>
                    )}
                </IonContent>
            </IonPage>
        );
    }
}

export default Messages;
