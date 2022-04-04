import React, { Component } from "react";
import { Redirect, Route } from "react-router-dom";
import {
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from "@ionic/react";
import HomeContainer from "./pages/survey/containers/HomeContainer";
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
import ChooseQuestionnaireContainer from "./pages/survey/containers/ChooseQuestionnaireContainer";
/* Theme variables */
import "./theme/variables.css";
import ChooseProfileContainer from "./pages/survey/containers/ChooseProfileContainer";
import {
  bookSharp,
  clipboardSharp,
  notificationsSharp,
  personSharp,
} from "ionicons/icons";
import MessagesContainer from "./pages/tabs/messages/containers/MessagesContainer";
import ProfileContainer from "./pages/tabs/profile/containers/ProfileContainer";
import { Diary, NewEntry } from "./pages/tabs/diary";
import QuestionnaireWrapper from "./pages/questionnaire/QuestionnaireWrapper";
import EHRReceiptsContainer from "./pages/tabs/ehr-link/containers/EHRReceiptsContainer";
import AddEHRContainer from "./pages/tabs/ehr-link/containers/AddEHRContainer";
import StartEHRLinkProcessContainer from "./pages/tabs/ehr-link/containers/StartEHRLinkProcessContainer";
import { ParticipantResponse, User } from "./interfaces/DataTypes";
import { environments, routes } from "./utils/Constants";
import { RouteComponentProps } from "react-router";

interface MainTabsProps extends RouteComponentProps {
  firebaseLoggedIn: boolean;
  prefersDarkMode: boolean;
  participantResponse: Array<ParticipantResponse>;
  profile: User;
}

class Tabs extends Component<MainTabsProps, {}> {
  render() {
    let { firebaseLoggedIn, prefersDarkMode, history, location, match } =
      this.props;
    if (process.env.NODE_ENV === environments.DEVELOPMENT)
      console.log(`firebase logged in: ${firebaseLoggedIn}`);

    if (firebaseLoggedIn) {
      return (
        <IonTabs>
          <IonRouterOutlet>
            <Redirect exact={true} path="/tabs" to={routes.TAB1} />
            <Redirect exact={true} path="/tab2" to={routes.TAB2} />
            <Redirect exact={true} path="/tab3" to={routes.TAB3} />
            <Route
              path={routes.TAB1}
              render={(props: any) => (
                <HomeContainer
                  {...props}
                  firebaseLoggedIn={firebaseLoggedIn}
                  darkMode={prefersDarkMode}
                />
              )}
              exact={true}
            />
            <Route
              path={routes.TAB2}
              component={ProfileContainer}
              exact={true}
            />
            <Route
              path={routes.TAB3}
              component={MessagesContainer}
              exact={true}
            />
            <Route path={routes.DIARY} component={Diary} exact={true} />
            <Route
              path={routes.NEW_DIARY_ENTRY}
              component={NewEntry}
              exact={true}
            />
            <Route
              path={`${routes.TABS}/survey/:id/questionnaire/:q13id`}
              component={ChooseProfileContainer}
              exact={true}
            />
            <Route
              path={`${routes.TABS}/survey/:id`}
              component={ChooseQuestionnaireContainer}
              exact={true}
            />
            <Route
              path={`${routes.DO_QUESTIONNAIRE}/survey/:surveyId/questionnaire/:id`}
              render={(props: any) => (
                <QuestionnaireWrapper
                  //history={this.props.history}
                  {...props}
                  participantId={this.props.profile.participantId}
                  history={history}
                  location={location}
                  match={match}
                />
              )}
              exact={true}
            />
            <Route
              path={routes.EHR}
              component={EHRReceiptsContainer}
              exact={true}
            />
            <Route
              path={routes.ADD_EHR}
              component={AddEHRContainer}
              exact={true}
            />
            <Route
              path={routes.START_EHR_LINK}
              component={StartEHRLinkProcessContainer}
              exact={true}
            />
          </IonRouterOutlet>
          <IonTabBar slot="bottom" id="tabBar">
            <IonTabButton tab="tab1" href={routes.TAB1}>
              <IonIcon icon={clipboardSharp} />
              <IonLabel>Surveys</IonLabel>
            </IonTabButton>
            <IonTabButton tab="tab2" href={routes.TAB2}>
              <IonIcon icon={personSharp} />
              <IonLabel>Profile</IonLabel>
            </IonTabButton>
            <IonTabButton tab="tab3" href={routes.TAB3}>
              <IonIcon icon={notificationsSharp} />
              <IonLabel>Messages</IonLabel>
            </IonTabButton>
            <IonTabButton tab="diary" href={routes.DIARY}>
              <IonIcon icon={bookSharp} />
              <IonLabel>Self-Report</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      );
    } else {
      return <Redirect to={routes.LOGIN_CARD} />;
    }
  }
}

export default Tabs;
