import React, { Component } from "react";
import { IonContent, IonLoading, IonPage } from "@ionic/react";
import AppHeader from "./pages/layout/AppHeader";
import VerifyEmailContainer from "./VerifyEmailContainer";
import { FirebaseAuth, User } from "./interfaces/DataTypes";

interface PassedProps {
  setReadyState: Function;
  fireBaseAuth: FirebaseAuth;
  applicationReady: boolean;
  refreshAll: Function;
  previewMode: boolean;
  firebaseLoggedIn: boolean;
  profile: User;
  children: any;
}

interface SplashScreenState {
  surveysFetched: boolean;
}

class SplashScreen extends Component<PassedProps, SplashScreenState> {
  constructor(props: PassedProps) {
    super(props);
    this.state = { surveysFetched: false };
  }

  componentDidMount(): void {
    this.props.setReadyState(false);
  }

  UNSAFE_componentWillReceiveProps(nextProps: Readonly<PassedProps>): void {
    const { fireBaseAuth, applicationReady } = this.props;
    const { profile, firebaseLoggedIn } = nextProps;
    const { surveysFetched } = this.state;
    const { emailVerified } = fireBaseAuth;

    if (nextProps.previewMode === true) {
      this.props.setReadyState(true);
    } else if (firebaseLoggedIn && !emailVerified && !applicationReady) {
      this.props.setReadyState(true);
    } else if (firebaseLoggedIn && profile.participantId && !surveysFetched) {
      this.props.refreshAll(
        profile.org,
        profile.participantId,
        fireBaseAuth.uid,
        profile.pushEnabled
      );
      this.setState({ surveysFetched: true });
    } else if (!firebaseLoggedIn) {
      this.setState({ surveysFetched: false });
    } else {
      // do nothing
    }
  }

  render() {
    const { fireBaseAuth, applicationReady, previewMode, firebaseLoggedIn } =
      this.props;
    const { emailVerified } = fireBaseAuth;
    let renderedContent;
    if (
      firebaseLoggedIn &&
      !emailVerified &&
      window.location.pathname.indexOf("action") === -1
    ) {
      return <VerifyEmailContainer />;
    }
    if (firebaseLoggedIn && window.location.pathname.indexOf("action") === -1) {
      renderedContent =
        applicationReady && !emailVerified && !previewMode ? (
          <VerifyEmailContainer />
        ) : (
          this.props.children
        );
    } else {
      renderedContent = this.props.children;
    }
    if (previewMode) return renderedContent;

    if (!applicationReady && firebaseLoggedIn) {
      return (
        <IonPage>
          <AppHeader showHeader={true} />
          <IonContent>
            <IonLoading isOpen={true} message={"Loading..."} />
          </IonContent>
        </IonPage>
      );
    }

    return renderedContent;
  }
}

export default SplashScreen;
