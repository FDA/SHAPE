import React, { Component } from "react";
import { Redirect, Route, RouteComponentProps } from "react-router-dom";
import { IonApp, IonRouterOutlet } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import firebase, { analytics } from "./config/fb";
/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";
/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
import LoginContainer from "./pages/login/containers/LoginContainer";
import RegisterContainer from "./pages/authentication/containers/RegisterContainer";
import ChooseQuestionnaireContainer from "./pages/survey/containers/ChooseQuestionnaireContainer";
/* Theme variables */
import "./theme/variables.css";
import ParticipantLookupContainer from "./pages/authentication/containers/ParticipantLookupContainer";
import SecurityQuestionsContainer from "./pages/authentication/containers/SecurityQuestionsContainer";
import PasswordResetContainer from "./pages/authentication/containers/PasswordResetContainer";
import AuthActionPageContainer from "./pages/authentication/containers/AuthActionPageContainer";
import AddParticipantsContainer from "./pages/authentication/containers/AddParticipantsContainer";
import SplashScreenContainer from "./SplashScreenContainer";
import QuestionnairePreviewContainer from "./pages/questionnaire/containers/QuestionnairePreviewContainer";
import TermsOfService from "./pages/authentication/TermsOfService";
import OnCompleteContainer from "./pages/tabs/ehr-link/containers/OnCompleteContainer";
import LinkPatientEHRContainer from "./pages/tabs/ehr-link/containers/LinkPatientEHRContainer";
import LoginCardContainer from "./pages/login/containers/LoginCardContainer";
import TabsContainer from "./TabsContainer";
import ErrorBoundary from "./pages/layout/ErrorBoundary";
import AppUrlListener from "./AppUrlListener";
import { FirebaseAuth } from "./interfaces/DataTypes";
import { environments, routes } from "./utils/Constants";

// To update the native build, do: <ios> <android>
// ionic build && ionic capacitor sync ios && ionic capacitor open ios
// > home > chooseQuestionnaire? surveyId > ChooseProfile? surveyId/q13Id > show questionnaire

interface AppProps extends RouteComponentProps {
  setPreviewMode: Function;
  fireBaseAuth: FirebaseAuth;
  previewMode: boolean;
  setDarkMode: Function;
  darkMode: boolean;
}

interface AppState {
  firebaseLoggedIn: boolean;
  previewMode: boolean;
}

class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = {
      firebaseLoggedIn: false,
      previewMode: false,
    };
    this.toggleDarkTheme = this.toggleDarkTheme.bind(this);
  }

  // Add or remove the "dark" class based on if the media query matches
  toggleDarkTheme = (shouldAdd: boolean | undefined) => {
    document.body.classList.toggle("dark", shouldAdd);
    this.props.setDarkMode(shouldAdd);
  };

  componentDidMount(): void {
    if (this.getPreviewMode()) {
      this.setState({
        previewMode: true,
      });
      return;
    }

    // Use matchMedia to check the user preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

    this.toggleDarkTheme(prefersDark.matches);

    // Listen for changes to the prefers-color-scheme media query
    prefersDark.addEventListener("change", (mediaQuery) =>
      this.toggleDarkTheme(mediaQuery.matches)
    );
    this.props.setDarkMode(prefersDark.matches);
    const self = this;

    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        analytics.setUserId(user.uid);
        // User is signed in.
        if (process.env.NODE_ENV === environments.DEVELOPMENT)
          console.log(`Firebase user login (App.tsx)`);
        self.setState({ firebaseLoggedIn: true });
      } else {
        if (process.env.NODE_ENV === environments.DEVELOPMENT)
          console.log("Firebase user logged out (App.tsx)");
        self.setState({ firebaseLoggedIn: false });
      }
    });
  }

  getPreviewMode = () => {
    const currentUrl = window.location.href;
    const result =
      currentUrl.includes(routes.PREVIEW_QUESTIONNAIRE) ||
      currentUrl.includes(routes.PREVIEW_SURVEY);
    if (result) {
      this.props.setPreviewMode(true);
    }
    return result;
  };

  getPreviewRoutes = () => {
    return (
      <IonRouterOutlet>
        <Route
          path={`${routes.PREVIEW_QUESTIONNAIRE}/survey/:surveyId/questionnaire/:id/token/:token`}
          component={QuestionnairePreviewContainer}
          exact={false}
        />
        <Route
          path={`${routes.PREVIEW_SURVEY}/survey/:id/previewmode/:previewmode/token/:token`}
          component={ChooseQuestionnaireContainer}
          exact={true}
        />
      </IonRouterOutlet>
    );
  };

  render() {
    const { firebaseLoggedIn } = this.state;
    const { darkMode, history, location, match } = this.props;
    const classModifer = darkMode ? "dark-theme" : "";

    return (
      <IonApp className={classModifer}>
        <ErrorBoundary>
          <IonReactRouter>
            <AppUrlListener />
            <SplashScreenContainer firebaseLoggedIn={firebaseLoggedIn}>
              {this.state.previewMode && this.getPreviewRoutes()}
              {!this.state.previewMode && (
                <IonRouterOutlet>
                  <Redirect
                    exact={true}
                    path={routes.HOME}
                    to={routes.LOGIN_CARD}
                  />
                  <Route
                    path={routes.LOGIN_CARD}
                    exact={true}
                    render={() => (
                      <LoginCardContainer firebaseLoggedIn={firebaseLoggedIn} />
                    )}
                  />
                  <Route
                    path={routes.LOGIN}
                    component={LoginContainer}
                    exact={true}
                  />
                  <Route
                    path={routes.TERMS_AND_CONDITIONS}
                    component={TermsOfService}
                    exact={true}
                  />
                  <Route
                    path={routes.REGISTER}
                    component={RegisterContainer}
                    exact={true}
                  />
                  <Route
                    path={routes.PASSWORD_RESET}
                    component={PasswordResetContainer}
                    exact={true}
                  />
                  <Route
                    path={routes.TABS}
                    component={() => (
                      <TabsContainer
                        history={history}
                        location={location}
                        match={match}
                        firebaseLoggedIn={firebaseLoggedIn}
                        prefersDarkMode={darkMode}
                      />
                    )}
                  />
                  <Route
                    path={routes.SECURITY_QUESTIONS}
                    component={SecurityQuestionsContainer}
                    exact={true}
                  />
                  <Route
                    path={routes.PARTICIPANT_QUERY}
                    component={ParticipantLookupContainer}
                    exact={true}
                  />
                  <Route
                    path={routes.PARTICIPANT_ADD}
                    component={AddParticipantsContainer}
                    exact={true}
                  />
                  <Route
                    path={routes.ON_EHR_COMPLETE}
                    component={OnCompleteContainer}
                    exact={true}
                  />
                  <Route
                    path={`${routes.STORE_EHR}/:patientId`}
                    component={LinkPatientEHRContainer}
                    exact={true}
                  />
                  <Route
                    path={routes.ACTION}
                    component={AuthActionPageContainer}
                    exact={true}
                  />
                  <Route
                    render={() => (
                      <LoginCardContainer firebaseLoggedIn={firebaseLoggedIn} />
                    )}
                  />
                </IonRouterOutlet>
              )}
            </SplashScreenContainer>
          </IonReactRouter>
        </ErrorBoundary>
      </IonApp>
    );
  }
}

export default App;
