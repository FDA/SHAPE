import React, { Component } from "react";
import {
  IonButton,
  IonContent,
  IonFooter,
  IonLoading,
  IonPage,
  IonToolbar,
} from "@ionic/react";
import AppHeader from "../../layout/AppHeader";
import { Redirect } from "react-router";
import PatientView from "./PatientView";
import { routes } from "../../../utils/Constants";

interface PassedProps {
  ehr: any;
  patientSearch: Function;
  loading: boolean;
}

interface OnCompleteState {
  redirectToHome: boolean;
  ehr: any;
}

class OnComplete extends Component<PassedProps, OnCompleteState> {
  constructor(props: PassedProps) {
    super(props);
    this.state = {
      redirectToHome: false,
      ehr: this.props.ehr,
    };
  }

  componentDidMount(): void {
    this.setState({
      redirectToHome: false,
    });
  }

  goHome = () => {
    this.setState({
      redirectToHome: true,
    });
  };

  getPatient = () => {
    const { ehr } = this.props;
    this.props.patientSearch(ehr);
  };

  render() {
    const { redirectToHome } = this.state;
    const { loading } = this.props;
    if (redirectToHome) {
      return <Redirect to={routes.TABS} />;
    }
    let { ehr } = this.props ? this.props : { ehr: {} };
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const success = urlParams.get("success") === "true";
    const { patient } = ehr;
    const patientData = patient ? <PatientView data={patient} /> : null;
    const msg = success
      ? "Successfully linked EHR records"
      : "Unable to link EHR records at this time.";
    const nextStep =
      success && !patientData ? (
        <IonButton
          id="logout"
          fill="solid"
          expand="block"
          onClick={this.getPatient}
        >
          Get Records
        </IonButton>
      ) : null;
    return (
      <IonPage>
        <AppHeader showHeader={true} text={"Provider Link"} />
        <IonContent className="ion-padding">
          <p>{msg}</p>
          {success && patient === undefined && (
            <p>
              We were able to successfully link your EHR records to our system,
              the next step is to actually query the system to pull your
              records. Click the button to continue.
            </p>
          )}
          {success && patient && (
            <p>
              Now select the person you would like to link health records for.
            </p>
          )}
          {nextStep}
          <IonLoading isOpen={loading} message={"Loading Patient Data..."} />
          {patientData}
        </IonContent>
        <IonFooter className="ion-no-border">
          <IonToolbar>
            <IonButton
              id="logout"
              fill="solid"
              expand="block"
              onClick={this.goHome}
              color="light"
            >
              Quit without continuing
            </IonButton>
          </IonToolbar>
        </IonFooter>
      </IonPage>
    );
  }
}
export default OnComplete;
