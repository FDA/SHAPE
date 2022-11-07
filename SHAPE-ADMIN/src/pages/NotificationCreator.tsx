import React from 'react';
import { connect } from 'react-redux';
import {
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonPage,
    IonToolbar,
    IonLabel,
    IonButton
} from '@ionic/react';
import { withRouter, RouteComponentProps, Redirect } from 'react-router-dom';
import { UserAuthenticationObject } from '../interfaces/DataTypes';
import { routes } from '../utils/Constants';
import NotificationCreatorPrivate from './NotificationCreatorPrivate';
import NotificationCreatorPublic from './NotificationCreatorPublic';

interface StateProps {
    selectedView: string;
}

interface NCProps extends RouteComponentProps {
    authentication: UserAuthenticationObject;
}

class NotificationCreator extends React.Component<NCProps, StateProps> {
    constructor(props: NCProps) {
        super(props);
        this.state = {
            selectedView: 'private'
        };
    }
    clicked = (view: string) => {
        this.setState({ selectedView: view });
    };

    getStyle = (view: string) => {
        if (view === this.state.selectedView) return 'primary';
        else return 'light';
    };

    render() {
        let { selectedView } = this.state;

        let { loggedIn } = this.props.authentication;
        if (!loggedIn) return <Redirect to={routes.HOME} />;
        return (
            <IonPage>
                <IonHeader aria-label='Send Notifications'>
                    <IonToolbar>
                        <IonButtons slot='start'>
                            <IonBackButton defaultHref={routes.HOME} aria-label='Back' />
                        </IonButtons>
                        <div style={{ textAlign: 'center', width: '100%' }}>
                            <IonButton
                                color={this.getStyle('private')}
                                onClick={() => this.clicked('private')}>
                                <IonLabel>Private Surveys</IonLabel>
                            </IonButton>

                            <IonButton color={this.getStyle('public')} onClick={() => this.clicked('public')}>
                                <IonLabel>Public Surveys</IonLabel>
                            </IonButton>
                        </div>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    {selectedView === 'private' && <NotificationCreatorPrivate />}
                    {selectedView === 'public' && <NotificationCreatorPublic />}
                </IonContent>
            </IonPage>
        );
    }
}

function mapStateToProps(state: any) {
    return {
        authentication: state.authentication
    };
}

export default withRouter(connect(mapStateToProps)(NotificationCreator));
