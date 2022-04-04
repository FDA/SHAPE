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
import {add} from 'ionicons/icons';
import React from 'react';
import {RouteComponentProps} from 'react-router';
import {chunk} from 'lodash';
import AppHeader from '../layout/AppHeader';
import {Survey, AdminUser} from '../interfaces/DataTypes';
import {connect} from 'react-redux';
import {isEmptyObject} from '../utils/Utils';
import LoadingScreen from '../layout/LoadingScreen';
import {storeSurveyList} from '../redux/actions/Survey';
import {SurveyCard, LoginCard} from '../homePage';
import {routes} from '../utils/Constants';

interface ReduxProps extends RouteComponentProps {
    surveyList: Array<Survey>;
    profile: AdminUser;
    loggedIn: boolean;
    storeSurveyList: any;
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

    render() {
        const {profile, loggedIn, surveyList, isLoading} = this.props;
        let {error} = this.state;
        const superUser = profile && profile.org && profile.org === 'ALL';

        let chunkedData = chunk(surveyList, 4);

        return (
            <IonPage>
                <AppHeader />
                <IonContent className="ion-padding">
                    {loggedIn && (
                        <>
                            <IonGrid>
                                <IonRow>
                                    <IonCol
                                        size="12"
                                        style={{textAlign: 'right'}}>
                                        {!superUser && (
                                            <h2>
                                                Welcome {profile.contactName},{' '}
                                                {profile.name}
                                            </h2>
                                        )}
                                        <IonButton
                                            fill="solid"
                                            size="default"
                                            color="primary"
                                            routerLink={
                                                routes.NEW_NOTIFICATION
                                            }>
                                            Send Notification
                                        </IonButton>
                                        <IonButton
                                            fill="solid"
                                            size="default"
                                            color="secondary"
                                            routerLink={
                                                routes.PAST_NOTIFICATIONS
                                            }>
                                            View Sent Notifications
                                        </IonButton>
                                        <IonButton
                                            fill="solid"
                                            size="default"
                                            color="tertiary"
                                            routerLink={routes.EHR_RECEIPTS}>
                                            EHR Receipts
                                        </IonButton>
                                        {superUser && (
                                            <IonButton
                                                fill="solid"
                                                size="default"
                                                routerLink={routes.ORG_LIST}
                                                color="medium">
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
                                    <IonCard style={{textAlign: 'center'}}>
                                        <IonCardContent>
                                            No surveys are currently available.
                                        </IonCardContent>
                                    </IonCard>
                                )}
                                {chunkedData.map(
                                    (surveys: any, index: number) => {
                                        return (
                                            <IonRow key={index}>
                                                {surveys.map(
                                                    (survey: Survey) => {
                                                        return (
                                                            <IonCol
                                                                size="3"
                                                                key={survey.id}>
                                                                <SurveyCard
                                                                    survey={
                                                                        survey
                                                                    }
                                                                />
                                                            </IonCol>
                                                        );
                                                    }
                                                )}
                                            </IonRow>
                                        );
                                    }
                                )}
                            </IonGrid>
                            <IonFab
                                vertical="bottom"
                                horizontal="end"
                                slot="fixed">
                                <IonFabButton
                                    onClick={() =>
                                        this.props.history.push(
                                            routes.NEW_SURVEY
                                        )
                                    }>
                                    <IonIcon icon={add} />
                                </IonFabButton>
                            </IonFab>
                        </>
                    )}

                    {loggedIn && error && (
                        <IonCard style={{textAlign: 'center'}}>
                            <IonCardContent>
                                <IonText color="danger">
                                    Error loading surveys. Try refreshing.
                                </IonText>
                            </IonCardContent>
                        </IonCard>
                    )}
                    {!loggedIn && (
                        <>
                            <LoginCard />
                            <IonButton
                                id="login"
                                href={routes.LOGIN}
                                style={{marginTop: '.5em'}}
                                expand="block"
                                color="primary">
                                Login
                            </IonButton>
                        </>
                    )}
                </IonContent>
            </IonPage>
        );
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
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
