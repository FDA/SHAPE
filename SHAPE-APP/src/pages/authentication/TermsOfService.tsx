import React, { Component } from "react";
import {
  IonButton,
  IonContent,
  IonFooter,
  IonPage,
  IonText,
  IonToolbar,
} from "@ionic/react";
import AppHeader from "../layout/AppHeader";
import { TSContent } from "./TSContent";
import { routes } from "../../utils/Constants";

interface TermsOfServiceState {
  buttonEnabled: boolean;
}

class TermsOfService extends Component<{}, TermsOfServiceState> {
  constructor(props: any) {
    super(props);
    this.state = { buttonEnabled: false };
  }

  enableButton = () => {
    const { buttonEnabled } = this.state;
    if (!buttonEnabled) {
      this.setState({ buttonEnabled: true });
    }
  };

  render() {
    const { buttonEnabled } = this.state;
    return (
      <>
        <IonPage>
          <AppHeader showHeader={true} text={"Terms of Service"} />
          <IonContent
            className="ion-padding"
            scrollEvents={true}
            onIonScrollEnd={this.enableButton}
          >
            <IonText className="ion-text-center">
              <h1>SHAPE App NORD Terms of Service</h1>
            </IonText>
            <div>
              <TSContent />
            </div>
          </IonContent>
          <IonFooter>
            <IonToolbar className="ion-no-border">
              <IonButton
                routerLink={routes.PARTICIPANT_QUERY}
                style={{ marginTop: ".5em" }}
                expand="block"
                fill="solid"
                type="button"
                disabled={!buttonEnabled}
                color="primary"
              >
                I agree, Continue.
              </IonButton>
            </IonToolbar>
          </IonFooter>
        </IonPage>
      </>
    );
  }
}

export default TermsOfService;
