import {
    IonButtons,
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonBackButton,
    IonSplitPane,
    IonMenu
} from '@ionic/react';
import React from 'react';
import {withRouter, RouteComponentProps} from 'react-router-dom';
import {routes} from '../utils/Constants';
import {connect} from 'react-redux';
import NewParticipant from './NewParticipant';
import AddSearchParticipant from './AddSearchParticipant';

interface ReduxProps extends RouteComponentProps {
    loggedIn: boolean;
}

interface State {
    failure: boolean;
    view: string;
}

const views = {
    CREATE: 'create',
    ADD_RESPONDENT: 'addRespondent'
};

class ParticipantEditor extends React.Component<ReduxProps, State> {
    constructor(props: ReduxProps) {
        super(props);
        this.state = {
            failure: false,
            view: views.CREATE
        };
    }

    componentDidMount() {
        const {loggedIn} = this.props;

        if (!loggedIn) {
            this.props.history.push(routes.LOGIN);
        }
    }

    handleMenuChange(menuItem: string) {
        this.setState({view: menuItem});
    }

    render() {
        let {view} = this.state;
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonBackButton defaultHref={routes.HOME} />
                        </IonButtons>
                        <IonTitle>Add Respondent</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <IonSplitPane contentId="topLevel">
                        <IonMenu
                            type="overlay"
                            disabled={false}
                            contentId="topLevel">
                            <IonHeader>
                                <IonToolbar>
                                    <IonTitle>Actions</IonTitle>
                                </IonToolbar>
                            </IonHeader>
                            <IonContent>
                                <IonList>
                                    <IonItem
                                        style={{cursor: 'pointer'}}
                                        onClick={() =>
                                            this.handleMenuChange(views.CREATE)
                                        }>
                                        Create New Respondent
                                    </IonItem>
                                    <IonItem
                                        style={{cursor: 'pointer'}}
                                        onClick={() =>
                                            this.handleMenuChange(
                                                views.ADD_RESPONDENT
                                            )
                                        }>
                                        Search and Add Respondent
                                    </IonItem>
                                </IonList>
                            </IonContent>
                        </IonMenu>
                        <IonContent id="topLevel">
                            {view === views.CREATE && <NewParticipant />}
                            {view === views.ADD_RESPONDENT && (
                                <AddSearchParticipant />
                            )}
                        </IonContent>
                    </IonSplitPane>
                </IonContent>
            </IonPage>
        );
    }
}

function mapStateToProps(state: any) {
    return {
        loggedIn: state.authentication.loggedIn
    };
}

export default connect(mapStateToProps)(withRouter(ParticipantEditor));
