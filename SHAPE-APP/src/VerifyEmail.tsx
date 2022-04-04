import React, { Component } from "react";
import {
  IonButton,
  IonContent,
  IonFooter,
  IonPage,
  IonText,
  IonToolbar,
} from "@ionic/react";
import AppHeader from "./pages/layout/AppHeader";
import { images, routes } from "./utils/Constants";

interface PassedProps {
  logout: Function;
  darkMode: boolean;
  resendVerificationEmail: Function;
}

class VerifyEmail extends Component<PassedProps, {}> {
  goHome = () => {
    this.props.logout();
  };

  render() {
    const { darkMode } = this.props;
    const footerLogo = darkMode ? images.GROUP_LOGO_DARK : images.GROUP_LOGO;
    return (
      <IonPage>
        <AppHeader showHeader={true} />
        <IonContent className="ion-padding">
          {" "}
          <img
            src="/assets/icon/one-step.png"
            alt="Verify your email address."
          />
          <IonText>
            <h3>
              Please verify your email address before you can use this
              application.
            </h3>
          </IonText>
          <IonButton
            expand="block"
            onClick={() => {
              this.props.resendVerificationEmail();
              this.goHome();
            }}
          >
            Resend Verification Email
          </IonButton>
          <IonButton
            color="light"
            expand="block"
            href={routes.HOME}
            onClick={this.goHome}
          >
            Home
          </IonButton>
        </IonContent>
        <IonFooter className="ion-no-border">
          <IonToolbar
            style={{
              paddingLeft: "6px",
              paddingBottom: "4px",
              paddingRight: "6px",
            }}
          >
            <img src={footerLogo} alt="footer" />
          </IonToolbar>
        </IonFooter>
      </IonPage>
    );
  }
}

export default VerifyEmail;
