import React, { Component, ReactNode } from "react";
import { Redirect, RouteComponentProps } from "react-router-dom";
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
} from "@ionic/react";
import { SurveyCard, NoDataCard } from "./components";
import AppHeader from "../layout/AppHeader";
import {
  Survey,
  User,
  FirebaseAuth,
  InformedConsent,
  Questionnaire,
} from "../../interfaces/DataTypes";
import { RefresherEventDetail } from "@ionic/core";
import { images, routes } from "../../utils/Constants";

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
}

interface HomeState {
  surveysFetched: boolean;
  showModal: boolean;
  currentSurvey: Survey;
  surveysLoaded: boolean;
}

class Home extends Component<PassedProps, HomeState> {
  constructor(props: PassedProps) {
    super(props);
    this.state = {
      surveysFetched: false,
      showModal: false,
      currentSurvey: {
        id: "",
        archived: false,
        name: "",
        shortDescription: "",
        description: "",
        informedConsent: "",
        open: true,
        dateCreated: "",
        org: "",
        participants: [],
      },
      surveysLoaded: false,
    };
  }

  setShowModal = (mode: boolean) => {
    this.setState({ showModal: mode });
  };

  agreeConsent = () => {
    const { currentSurvey } = this.state;
    const { profile } = this.props;
    const { email } = this.props.fireBaseAuth;
    this.props.agreeToInformedConsent(
      profile.participantId,
      currentSurvey.id,
      email
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
      this.props.history.push(`${routes.SURVEY}/${surveyClicked.id}`);
    } else {
      this.setShowModal(true);
      this.setState({ currentSurvey: surveyClicked });
    }
  };

  UNSAFE_componentWillReceiveProps(
    nextProps: Readonly<PassedProps>,
    nextContext: PassedProps
  ): void {
    this.setState({ surveysLoaded: true });
  }

  refreshState = (event: CustomEvent<RefresherEventDetail>) => {
    const { profile, fireBaseAuth } = this.props;
    this.props.refreshAll(
      profile.org,
      profile.participantId,
      fireBaseAuth.uid,
      profile.pushEnabled
    );
    this.setState({ surveysFetched: true });
    event.detail.complete();
  };

  render() {
    const { isEmpty } = this.props.fireBaseAuth;
    const { surveys, loading, darkMode, firebaseLoggedIn } = this.props;
    const footerLogo = darkMode ? images.GROUP_LOGO_DARK : images.GROUP_LOGO;
    const { showModal, currentSurvey } = this.state;
    const informedConsent = currentSurvey.informedConsent;

    let displayData: ReactNode = <NoDataCard />;

    if (!firebaseLoggedIn) return <Redirect to={routes.HOME} />;

    if (surveys && surveys.length > 0) {
      let filteredSurveys = surveys
        .filter((s: Survey) => {
          return s.open !== undefined && s.open;
        })
        .sort((a: Survey, b: Survey) =>
          a.dateCreated < b.dateCreated ? 1 : -1
        );
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
                  questionnaires={this.props.questionnaires}
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
            <AppHeader showHeader={false} />
            <IonContent className="ion-padding">
              <h3>You must first read and agree to the informed consent</h3>
              <p>
                A copy of this document will be sent to the email address that
                is on file when you registered.
              </p>
              <hr />
              <p>{informedConsent}</p>
            </IonContent>
            <IonFooter className="ion-no-border">
              <IonButton onClick={() => this.agreeConsent()}>I agree</IonButton>
              <IonButton onClick={() => this.setShowModal(false)}>
                I do not agree
              </IonButton>
            </IonFooter>
          </IonModal>
          <AppHeader showHeader={!isEmpty} text={"Surveys"} />
          <IonContent>
            <IonLoading isOpen={loading} message={"Loading..."} />
            <IonRefresher
              slot="fixed"
              onIonRefresh={this.refreshState}
              pullFactor={0.5}
              pullMin={100}
              pullMax={200}
            >
              <IonRefresherContent />
            </IonRefresher>
            <IonGrid>{displayData}</IonGrid>
          </IonContent>
          {isEmpty && (
            <IonFooter className="ion-no-border">
              <IonToolbar>
                <IonItem>
                  <img src={footerLogo} alt="footer-logo" />
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
