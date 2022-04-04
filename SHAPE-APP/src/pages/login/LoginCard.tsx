import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import {
  IonButton,
  IonCol,
  IonContent,
  IonFooter,
  IonItem,
  IonLabel,
  IonPage,
  IonRow,
  IonToast,
  IonToolbar,
  IonHeader,
} from "@ionic/react";
import { isEmptyObject } from "../../utils/Utils";
import build from "../../build-info.json";
import { images, routes } from "../../utils/Constants";

interface PassedProps {
  darkMode: boolean;
  firebaseLoggedIn: boolean;
  emailVerificationResendSuccess: boolean;
  authError: string | null;
  resetResendVerification: Function;
  clearAuthError: Function;
}

class LoginCard extends Component<PassedProps, {}> {
  render() {
    const { darkMode } = this.props;
    const icon = darkMode ? images.LOGO_300_DARK : images.LOGO_300;
    const footerLogo = darkMode ? images.GROUP_LOGO_DARK : images.GROUP_LOGO;

    if (this.props.firebaseLoggedIn) {
      return <Redirect to={routes.TABS} />;
    }

    return (
      <IonPage style={{ textAlign: "center" }}>
        <IonHeader>
          <IonToolbar>&nbsp;</IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonRow>
            <IonCol>
              <img src={icon} alt="Shape Logo" style={{ maxHeight: "70%" }} />
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <IonLabel className="hero-text">
                Survey of Health and Patient Experience
              </IonLabel>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol style={{ textAlign: "center" }}>
              <IonButton
                id="login"
                routerLink={routes.LOGIN}
                style={{ marginTop: ".5em" }}
                expand="block"
                color="primary"
              >
                Login
              </IonButton>
              <IonButton
                type="button"
                id="register"
                routerLink={routes.TERMS_AND_CONDITIONS}
                style={{ marginTop: ".5em" }}
                expand="block"
                fill="solid"
                color="light"
              >
                I have a code -- Register me
              </IonButton>
              <p
                style={{
                  color: "#9F9F9F",
                  marginTop: "1.0em",
                  fontSize: "12px",
                }}
              >
                In order to register to use this app, you must have previously
                received a respondent code.
              </p>
              <p
                style={{
                  color: "#9F9F9F",
                  marginTop: "1.0em",
                  fontSize: "12px",
                }}
              >
                Build {build.build}, &nbsp; {build.buildDate}
              </p>
            </IonCol>
          </IonRow>
        </IonContent>
        <IonFooter className="ion-no-border">
          <IonToolbar>
            <IonItem>
              <img src={footerLogo} alt="footer" />
            </IonItem>
          </IonToolbar>
        </IonFooter>
        <IonToast
          isOpen={this.props.emailVerificationResendSuccess}
          color={"success"}
          message="Email verification was successfully sent."
          buttons={[
            {
              text: "Okay",
              role: "cancel",
              handler: () => {
                this.props.resetResendVerification(false);
              },
            },
          ]}
        />
        <IonToast
          isOpen={
            this.props.emailVerificationResendSuccess === false &&
            !isEmptyObject(this.props.authError)
          }
          color={"danger"}
          message="Verification email failed to send. Please try again."
          buttons={[
            {
              text: "Okay",
              role: "cancel",
              handler: () => {
                this.props.clearAuthError();
              },
            },
          ]}
        />
      </IonPage>
    );
  }
}

export default LoginCard;
