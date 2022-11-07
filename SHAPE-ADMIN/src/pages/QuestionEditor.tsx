import {
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonSplitPane,
    IonMenu
} from '@ionic/react';
import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import AddSearch from '../questionAction/AddSearch';
import NewQuestion from '../questionAction/NewQuestion';
import { routes } from '../utils/Constants';
import { connect } from 'react-redux';

const views = {
    CREATE: 'create',
    ADD_QUESTION: 'addQuestion',
    QUESTION_LOGIC: 'questionLogic'
};

interface ReduxProps extends RouteComponentProps {
    loggedIn: boolean;
}

interface State {
    failure: boolean;
    view: string;
}

class QuestionEditor extends React.Component<ReduxProps, State> {
    constructor(props: ReduxProps) {
        super(props);
        this.state = {
            failure: false,
            view: views.CREATE
        };
    }

    componentDidMount() {
        const { loggedIn } = this.props;

        if (!loggedIn) {
            this.props.history.push(routes.LOGIN);
        }
    }

    handleMenuChange(menuItem: string) {
        this.setState({ view: menuItem });
    }

    render() {
        let { view } = this.state;

        return (
            <IonPage>
                <IonHeader aria-label='Add Question'>
                    <IonToolbar>
                        <IonButtons slot='start'>
                            <IonBackButton defaultHref={routes.HOME} />
                        </IonButtons>
                        <IonTitle>Add Question</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent aria-label='Container'>
                    <IonSplitPane contentId='topLevel'>
                        <IonMenu
                            type='overlay'
                            disabled={false}
                            contentId='topLevel'
                            style={{ maxWidth: '200px' }}>
                            <IonHeader aria-label='Actions'>
                                <IonToolbar>
                                    <IonTitle>Actions</IonTitle>
                                </IonToolbar>
                            </IonHeader>
                            <IonContent aria-label='Buttons'>
                                <IonList>
                                    <IonItem
                                        button
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => this.handleMenuChange(views.CREATE)}>
                                        Create New
                                    </IonItem>
                                    <IonItem
                                        button
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => this.handleMenuChange(views.ADD_QUESTION)}>
                                        Search and Add Questions
                                    </IonItem>
                                </IonList>
                            </IonContent>
                        </IonMenu>
                        <IonContent id='topLevel' aria-label='Content'>
                            {view === views.CREATE && <NewQuestion />}
                            {view === views.ADD_QUESTION && <AddSearch />}
                            {view === views.QUESTION_LOGIC && `Not yet implemented.`}
                        </IonContent>
                    </IonSplitPane>
                </IonContent>
            </IonPage>
        );
    }
}

const mapStateToProps = (state: any) => ({
    loggedIn: state.authentication.loggedIn
});

export default connect(mapStateToProps)(withRouter(QuestionEditor));
