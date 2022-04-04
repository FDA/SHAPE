import React, {useState} from 'react';
import {Redirect, Route} from 'react-router-dom';
import {IonApp, IonRouterOutlet} from '@ionic/react';
import {IonReactRouter} from '@ionic/react-router';
import Home from './pages/Home';
import NewSurvey from './pages/NewSurvey';
import NewQuestionnaire from './pages/NewQuestionnaire';
import SurveyEditor from './pages/SurveyEditor';
import QuestionEditor from './pages/QuestionEditor';
import NewQ13Participant from './pages/NewQ13Participant';
import NotificationCreator from './pages/NotificationCreator';
import NotificationHistory from './pages/NotificationHistory';
import ParticipantEditor from './pages/ParticipantEditor';
import EHRReceipts from './pages/EHRReceipts';
import 'firebase/auth';
/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
/* Theme variables */
import './theme/variables.css';
import OrgList from './pages/OrgList';
import OrgEditor from './pages/OrgEditor';
import Login from './pages/Login';
import Q13Editor from './pages/q13Editor';
import ErrorBoundary from './pages/ErrorBoundary';
import PasswordReset from './authentication/PasswordReset';
import Timeout from './pages/Timeout';
import {firebase} from './config';
import ProtectedRoute from './authentication/ProtectedRoute';
import {getEnvVar} from './utils/API';
import {routes} from './utils/Constants';

// To update the native build, do: <ios> <android>
// ionic build && ionic capacitor sync ios && ionic capacitor open ios
const App: React.FC = () => {
    getEnvVar({key: 'api'}, {})
        .then((res: any) => {
            const api = res.data.api.url;
            localStorage.setItem('apiUrl', api);
        })
        .catch((err: any) => {
            console.error(err);
        });

    const [firebaseLoggedIn, setFirebaseLoggedIn] = useState(false);
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in.
            setFirebaseLoggedIn(true);
        } else {
            setFirebaseLoggedIn(false);
        }
    });

    return (
        <IonApp>
            <Timeout />
            <ErrorBoundary>
                <IonReactRouter>
                    <IonRouterOutlet>
                        <Route
                            path={routes.HOME}
                            component={Home}
                            exact={true}
                        />
                        <Route
                            path={routes.LOGIN}
                            component={Login}
                            exact={true}
                        />
                        <Route
                            path={routes.PASSWORD_RESET}
                            component={PasswordReset}
                            exact={true}
                        />
                        <ProtectedRoute
                            path={`${routes.SURVEY}/:id`}
                            component={SurveyEditor}
                            exact={true}
                            isAuth={firebaseLoggedIn}
                        />
                        <ProtectedRoute
                            path={`${routes.SURVEY}/:surveyId/questionnaire/:id`}
                            component={Q13Editor}
                            exact={true}
                            isAuth={firebaseLoggedIn}
                        />
                        <ProtectedRoute
                            path={routes.NEW_SURVEY}
                            component={NewSurvey}
                            exact={true}
                            isAuth={firebaseLoggedIn}
                        />
                        <ProtectedRoute
                            path={routes.NEW_QUESTIONNAIRE}
                            component={NewQuestionnaire}
                            exact={true}
                            isAuth={firebaseLoggedIn}
                        />
                        <ProtectedRoute
                            path={routes.NEW_PARTICIPANT}
                            component={ParticipantEditor}
                            exact={true}
                            isAuth={firebaseLoggedIn}
                        />
                        <ProtectedRoute
                            path={routes.EDIT_QUESTIONS}
                            component={QuestionEditor}
                            exact={true}
                            isAuth={firebaseLoggedIn}
                        />
                        <ProtectedRoute
                            path={routes.NEW_Q13_PARTICIPANT}
                            component={NewQ13Participant}
                            exact={true}
                            isAuth={firebaseLoggedIn}
                        />
                        <ProtectedRoute
                            path={routes.NEW_NOTIFICATION}
                            component={NotificationCreator}
                            exact={true}
                            isAuth={firebaseLoggedIn}
                        />
                        <ProtectedRoute
                            path={routes.PAST_NOTIFICATIONS}
                            component={NotificationHistory}
                            exact={true}
                            isAuth={firebaseLoggedIn}
                        />
                        <ProtectedRoute
                            path={routes.EHR_RECEIPTS}
                            component={EHRReceipts}
                            exact={true}
                            isAuth={firebaseLoggedIn}
                        />
                        <Route
                            path={routes.ORG_LIST}
                            component={OrgList}
                            exact={true}
                        />

                        <Route
                            path={routes.ORG_ADD}
                            component={OrgEditor}
                            exact={true}
                        />
                        <Route
                            exact
                            path="/"
                            render={() => <Redirect to={routes.HOME} />}
                        />
                        <Route render={() => <Redirect to={routes.HOME} />} />
                    </IonRouterOutlet>
                </IonReactRouter>
            </ErrorBoundary>
        </IonApp>
    );
};

export default App;
