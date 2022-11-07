import React, { Component, createRef, ReactNode } from 'react';
import { Redirect, RouteComponentProps } from 'react-router-dom';
import {
    IonButton,
    IonCol,
    IonContent,
    IonFooter,
    IonGrid,
    IonItem,
    IonLoading,
    IonModal,
    IonPage,
    IonRefresher,
    IonRefresherContent,
    IonRow,
    IonToolbar,
    IonHeader
} from '@ionic/react';
import { SurveyCard, JoinSurveyCard } from './components';
import AppHeader from '../layout/AppHeader';
import {
    Survey,
    User,
    FirebaseAuth,
    InformedConsent,
    Questionnaire,
    ParticipantResponse
} from '../../interfaces/DataTypes';
import { RefresherEventDetail } from '@ionic/core/components';
import { images, routes } from '../../utils/Constants';

interface PassedProps extends RouteComponentProps {
    profile: User;
    fireBaseAuth: FirebaseAuth;
    agreeToInformedConsent: Function;
    consent: Array<InformedConsent>;
    refreshAll: Function;
    surveys: Array<Survey>;
    loading: boolean;
    darkMode: boolean;
    firebaseLoggedIn: boolean;
    questionnaires: Array<Questionnaire>;
    participantResponse: ParticipantResponse[];
    setOrg: Function;
}

interface HomeState {
    surveysFetched: boolean;
    showModal: boolean;
    currentSurvey: Survey;
    buttonEnabled: boolean;
}

class Home extends Component<PassedProps, HomeState> {
    scrollContainer: any = createRef();
    constructor(props: PassedProps) {
        super(props);
        this.state = {
            surveysFetched: false,
            showModal: false,
            currentSurvey: {
                id: '',
                archived: false,
                name: '',
                shortDescription: '',
                description: '',
                informedConsent: '',
                open: true,
                dateCreated: '',
                org: '',
                participants: [],
                public: false
            },
            buttonEnabled: false
        };
    }

    setShowModal = (mode: boolean) => {
        this.setState({ showModal: mode });
        setTimeout(this.checkScrollFinished, 3000);
    };

    agreeConsent = () => {
        const { currentSurvey } = this.state;
        const { profile, fireBaseAuth } = this.props;
        const { email } = this.props.fireBaseAuth;
        const participant = currentSurvey.public
            ? fireBaseAuth.uid
            : profile.participantId.filter((elem: any) => {
                  return elem.org === currentSurvey.org;
              })[0].id;
        this.props.agreeToInformedConsent(
            participant,
            currentSurvey.id,
            email,
            currentSurvey.org,
            fireBaseAuth.uid
        );
        this.setShowModal(false);
        this.props.history.push(`${routes.SURVEY}/${currentSurvey.id}`);
    };

    checkConsent = (event: any, surveyClicked: Survey) => {
        event.preventDefault();
        const { consent } = this.props;
        const agreed = consent.filter((ele: InformedConsent) => {
            return ele.surveyId === surveyClicked.id;
        });
        if (agreed.length > 0) {
            // agreed to informed consent already
            this.props.setOrg(surveyClicked.org);
            this.props.history.push(`${routes.SURVEY}/${surveyClicked.id}`);
        } else {
            this.setShowModal(true);
            this.setState({ currentSurvey: surveyClicked });
        }
    };

    refreshState = (event: CustomEvent<RefresherEventDetail>) => {
        this.props.refreshAll();
        this.setState({ surveysFetched: true });
        setTimeout(() => {
            event.detail.complete();
        }, 500);
    };

    enableButton = () => {
        const { buttonEnabled } = this.state;
        if (!buttonEnabled) {
            this.setState({ buttonEnabled: true });
        }
    };

    checkScrollFinished = () => {
        if (this.scrollContainer) {
            this.scrollContainer.getScrollElement().then((scrollElement: HTMLElement) => {
                const scrollMax = scrollElement.scrollHeight;
                const scrollDist = scrollElement.scrollTop;
                const clientHeight = scrollElement.clientHeight;
                if (scrollMax - scrollDist - clientHeight <= 5) {
                    this.enableButton();
                }
            });
        }
    };

    setRef = (element: any) => {
        this.scrollContainer = element;
    };

    render() {
        const { isEmpty } = this.props.fireBaseAuth;
        const { surveys, loading, darkMode, firebaseLoggedIn, profile, participantResponse, questionnaires } =
            this.props;
        const footerLogo = darkMode ? images.GROUP_LOGO_DARK : images.GROUP_LOGO;
        const { showModal, currentSurvey, buttonEnabled } = this.state;
        const informedConsent = currentSurvey.informedConsent;

        let displayData: ReactNode = <JoinSurveyCard />;

        if (!firebaseLoggedIn) return <Redirect to={routes.HOME} />;

        if (surveys && surveys.length > 0) {
            const filteredSurveys = surveys
                .filter((s: Survey) => {
                    return s.open !== undefined && s.open;
                })
                .sort((a: Survey, b: Survey) => (a.dateCreated < b.dateCreated ? 1 : -1));
            if (filteredSurveys.length > 0) {
                displayData = filteredSurveys.map((s: Survey) => {
                    return (
                        <IonRow key={s.id}>
                            <IonCol>
                                <SurveyCard
                                    id={s.id}
                                    onClick={(e: any) => this.checkConsent(e, s)}
                                    name={s.name}
                                    shortDescription={s.shortDescription}
                                    description={s.description}
                                    status={s.open}
                                    questionnaires={questionnaires}
                                    participantResponse={participantResponse}
                                    profile={profile}
                                />
                            </IonCol>
                        </IonRow>
                    );
                });
            }
        }

        return (
            <>
                <IonPage>
                    <IonModal isOpen={showModal} backdropDismiss={true}>
                        <IonHeader>
                            <IonToolbar className='ion-no-border' />
                        </IonHeader>
                        <IonContent
                            className='ion-padding'
                            ref={this.setRef}
                            scrollEvents={true}
                            onIonScrollEnd={this.checkScrollFinished}>
                            <h3>You must first read and agree to the informed consent</h3>
                            <p>
                                A copy of this document will be sent to the email address that is on file when
                                you registered.
                            </p>
                            <hr />
                            <p>{informedConsent}</p>
                        </IonContent>
                        <IonFooter className='ion-no-border'>
                            <IonToolbar className='ion-no-border'>
                                <IonRow className='ion-justify-content-evenly'>
                                    <IonButton
                                        style={{ flexBasis: '48%' }}
                                        className='ion-align-self-stretch'
                                        color='danger'
                                        onClick={() => this.setShowModal(false)}>
                                        I do not agree
                                    </IonButton>
                                    <IonButton
                                        disabled={!buttonEnabled}
                                        style={{ flexBasis: '48%' }}
                                        className='ion-align-self-stretch'
                                        onClick={() => this.agreeConsent()}>
                                        I agree
                                    </IonButton>
                                </IonRow>
                            </IonToolbar>
                        </IonFooter>
                    </IonModal>
                    <AppHeader showHeader={!isEmpty} text={'Surveys'} />
                    <IonContent>
                        <IonLoading isOpen={loading} message={'Loading...'} />
                        <IonRefresher slot='fixed' onIonRefresh={this.refreshState}>
                            <IonRefresherContent />
                        </IonRefresher>
                        <IonGrid>{displayData}</IonGrid>
                    </IonContent>
                    {isEmpty && (
                        <IonFooter className='ion-no-border'>
                            <IonToolbar>
                                <IonItem>
                                    <img src={footerLogo} alt='footer-logo' />
                                </IonItem>
                            </IonToolbar>
                        </IonFooter>
                    )}
                </IonPage>
            </>
        );
    }
}

export default Home;
