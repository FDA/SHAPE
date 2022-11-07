import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCol,
    IonContent,
    IonFab,
    IonFabButton,
    IonGrid,
    IonIcon,
    IonPage,
    IonRow,
    IonText
} from '@ionic/react';
import { add } from 'ionicons/icons';
import React from 'react';
import { RouteComponentProps } from 'react-router';
import { chunk } from 'lodash';
import AppHeader from '../layout/AppHeader';
import { Survey, AdminUser } from '../interfaces/DataTypes';
import { connect } from 'react-redux';
import { guid, isEmptyObject } from '../utils/Utils';
import LoadingScreen from '../layout/LoadingScreen';
import { storeSurveyList } from '../redux/actions/Survey';
import { SurveyCard, LoginCard } from '../homePage';
import { routes } from '../utils/Constants';
import { isEmpty, isLoaded } from 'react-redux-firebase';
import { logout } from '../redux/actions/Authentication';

interface ReduxProps extends RouteComponentProps {
    surveyList: Array<Survey>;
    profile: AdminUser;
    loggedIn: boolean;
    storeSurveyList: any;
    logoutDispatch: any;
    isLoading: boolean;
}

interface HomeProps {
    chunkedData: any;
    error: boolean;
}

class Home extends React.Component<ReduxProps, HomeProps> {
    constructor(props: ReduxProps) {
        super(props);
        this.state = {
            chunkedData: [],
            error: false
        };
    }

    UNSAFE_componentWillMount() {
        this.props.storeSurveyList();
    }

    checkAuth(loggedIn: boolean, profile: AdminUser) {
        const doneLoading = loggedIn && isLoaded(profile);
        // Occurs when user closes tab and returns without logging out.
        // We trigger the logout dispatch to redirect them back to login screen with unAuthenticated state.
        if (doneLoading && isEmpty(profile)) {
            this.props.logoutDispatch();
            console.log('No profile found, redirecting to login');
            return false;
        } else if (doneLoading && !isEmpty(profile)) {
            return true;
        } else return false;
    }

    render() {
        const { profile, loggedIn, surveyList, isLoading } = this.props;
        let { error } = this.state;
        let chunkedData = chunk(surveyList, 4);

        const superUser = profile && profile.org && profile.org === 'ALL';

        //true when authentication redux action completes and firebase profile has succesfully loaded into redux state
        const authenticated = this.checkAuth(loggedIn, profile);

        if (!isLoaded(profile)) {
            return (
                <IonPage>
                    <AppHeader />
                    <IonContent className='ion-padding'>
                        <LoadingScreen />
                    </IonContent>
                </IonPage>
            );
        } else {
            return (
                <IonPage>
                    <AppHeader />
                    <IonContent className='ion-padding' aria-label={`App-Content-${guid()}`}>
                        {authenticated && (
                            <>
                                <IonGrid>
                                    <IonRow>
                                        <IonCol size='12' style={{ textAlign: 'right' }}>
                                            {!superUser && (
                                                <h2>
                                                    Welcome {profile.contactName}, {profile.name}
                                                </h2>
                                            )}
                                            <IonButton
                                                fill='solid'
                                                size='default'
                                                color='primary'
                                                routerLink={routes.NEW_NOTIFICATION}>
                                                Send Notification
                                            </IonButton>
                                            <IonButton
                                                fill='solid'
                                                size='default'
                                                color='secondary'
                                                routerLink={routes.PAST_NOTIFICATIONS}>
                                                View Sent Notifications
                                            </IonButton>
                                            <IonButton
                                                fill='solid'
                                                size='default'
                                                color='tertiary'
                                                routerLink={routes.EHR_RECEIPTS}>
                                                EHR Receipts
                                            </IonButton>
                                            {superUser && (
                                                <IonButton
                                                    fill='solid'
                                                    size='default'
                                                    routerLink={routes.ORG_LIST}
                                                    color='medium'>
                                                    Manage Orgs
                                                </IonButton>
                                            )}
                                        </IonCol>
                                    </IonRow>
                                    {isLoading && (
                                        <IonRow>
                                            <LoadingScreen />
                                        </IonRow>
                                    )}
                                    {isEmptyObject(chunkedData) && (
                                        <IonCard style={{ textAlign: 'center' }}>
                                            <IonCardContent>
                                                No surveys are currently available.
                                            </IonCardContent>
                                        </IonCard>
                                    )}
                                    {chunkedData.map((surveys: any, index: number) => {
                                        return (
                                            <IonRow key={index}>
                                                {surveys.map((survey: Survey) => {
                                                    return (
                                                        <IonCol size='3' key={survey.id}>
                                                            <SurveyCard
                                                                aria-label={`Go to Survey ${survey.name}`}
                                                                survey={survey}
                                                            />
                                                        </IonCol>
                                                    );
                                                })}
                                            </IonRow>
                                        );
                                    })}
                                </IonGrid>
                                <IonFab vertical='bottom' horizontal='end' slot='fixed'>
                                    <IonFabButton
                                        title='Add survey'
                                        onClick={() => this.props.history.push(routes.NEW_SURVEY)}>
                                        <IonIcon icon={add} title='Add survey' />
                                    </IonFabButton>
                                </IonFab>
                            </>
                        )}
                        {authenticated && error && (
                            <IonCard style={{ textAlign: 'center' }}>
                                <IonCardContent>
                                    <IonText color='danger'>Error loading surveys. Try refreshing.</IonText>
                                </IonCardContent>
                            </IonCard>
                        )}
                        {!authenticated && (
                            <>
                                <LoginCard />
                                <IonButton
                                    id='login'
                                    href={routes.LOGIN}
                                    style={{ marginTop: '.5em' }}
                                    expand='block'
                                    color='primary'>
                                    Login
                                </IonButton>
                            </>
                        )}
                    </IonContent>
                </IonPage>
            );
        }
    }
}

const mapStateToProps = (state: any) => ({
    profile: state.firebase.profile,
    loggedIn: state.authentication.loggedIn,
    surveyList: state.surveyList,
    isLoading: state.loading
});

function mapDispatchToProps(dispatch: any) {
    return {
        storeSurveyList() {
            dispatch(storeSurveyList());
        },
        logoutDispatch() {
            dispatch(logout());
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
