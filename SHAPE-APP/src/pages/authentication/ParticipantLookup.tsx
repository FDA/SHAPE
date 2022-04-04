import React, { Component, SyntheticEvent } from "react";

import {
  IonButton,
  IonCol,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonRow,
  IonToast,
  IonSelect,
  IonSelectOption,
  IonText,
} from "@ionic/react";
import Loading from "../layout/Loading";
import AppHeader from "../layout/AppHeader";
import { isEmptyObject } from "../../utils/Utils";
import { ParticipantLookup as PL, Choice } from "../../interfaces/DataTypes";
import { images, environments, routes } from "../../utils/Constants";

interface PassedProps {
  toggleLoading: Function;
  participantLookup: Function;
  resetparticipantLookup: Function;
  loading: boolean;
  participant: PL;
  darkMode: boolean;
  orgs: Choice[];
}

interface ParticipantLookupState {
  participantId: string;
  selectedOrg: string;
  error: boolean;
}

class ParticipantLookup extends Component<PassedProps, ParticipantLookupState> {
  constructor(props: PassedProps) {
    super(props);
    this.state = {
      participantId: "",
      selectedOrg: "NORD", // TODO: change to empty string if a default or is undesirable
      error: false,
    };
  }

  handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    const { participantId, selectedOrg } = this.state;
    if (!isEmptyObject(selectedOrg)) {
      if (process.env.NODE_ENV === environments.DEVELOPMENT)
        console.log(
          `Trying to lookup patient: ${JSON.stringify(participantId)} `
        );
      this.props.toggleLoading(true);
      this.props.participantLookup(participantId, selectedOrg);
    } else {
      this.setState({ error: true });
    }
  };

  handleChange(event: CustomEvent<KeyboardEvent>) {
    const { value } = event.target as HTMLInputElement;
    this.setState({
      participantId: value,
    });
  }

  handleOrgChange(event: CustomEvent<any>) {
    const { value } = event.target as HTMLInputElement;
    this.setState({
      selectedOrg: value,
    });
  }

  resetState = () => {
    this.props.resetparticipantLookup();
    this.setState({
      participantId: "",
    });
  };

  componentDidMount() {
    this.setState({
      participantId: "",
    });
  }

  render = () => {
    const { loading, participant, darkMode, orgs } = this.props;
    const { error, selectedOrg } = this.state;

    const { participantId } = this.state;
    const registrationExists = !isEmptyObject(participant)
      ? participant.registrationExists
      : false;
    const querySuccess = !isEmptyObject(participant)
      ? participant.querySuccess
      : false;
    const LoadingIndicator = loading ? <Loading /> : null;
    const buttonColor =
      !querySuccess && !registrationExists ? "primary" : "light";
    const logo = darkMode ? images.LOGO_300_DARK : images.LOGO_300;
    const nextButton =
      participant && participant.securityQuestions ? (
        <IonButton
          slot="end"
          expand="block"
          fill="solid"
          id="securityQuestions"
          routerLink={routes.SECURITY_QUESTIONS}
          color="primary"
        >
          Next
        </IonButton>
      ) : null;

    return (
      <IonPage>
        <AppHeader showHeader={true} text={"Enter Code"} />
        <IonContent className="ion-padding">
          <span style={{ textAlign: "center" }}>
            <IonRow>
              <IonCol>
                <img src={logo} alt="Shape Logo" style={{ maxHeight: "70%" }} />
              </IonCol>
            </IonRow>
            <IonRow>
              <IonLabel className="hero-text">
                Survey of Health and Patient Experience Registration
              </IonLabel>
            </IonRow>
          </span>
          <p className="small-text">
            Please supply the respondent registration code provided to you for
            this survey application.
          </p>
          {LoadingIndicator}
          <form onSubmit={(e) => this.handleSubmit(e)}>
            <IonItem>
              <IonLabel style={{ textAlignVertical: "top" }} position="stacked">
                Registration Code
              </IonLabel>
              <IonInput
                data-testid="participant-field"
                clearOnEdit={true}
                name="participantId"
                required={true}
                value={participantId}
                id="participantId"
                onIonInput={(e) => this.handleChange(e)}
              />
            </IonItem>
            <IonItem>
              <IonLabel style={{ textAlignVertical: "top" }} position="stacked">
                Organization
              </IonLabel>
              <IonSelect
                data-testid="org-select"
                className="rounded-input"
                name={`orgSelect`}
                okText="Ok"
                cancelText="Cancel"
                onIonChange={(e) => this.handleOrgChange(e)}
                value={selectedOrg}
                placeholder={selectedOrg}
              >
                {orgs.map((choice) => {
                  return (
                    <IonSelectOption key={choice.id} value={choice.id}>
                      {choice.name}
                    </IonSelectOption>
                  );
                })}
              </IonSelect>
            </IonItem>
            {error && <IonText color="danger">Organization Required.</IonText>}
            {!querySuccess && !registrationExists ? (
              <IonButton
                data-testid="submit-button"
                fill="solid"
                expand="block"
                type="submit"
                id="submit"
                color={buttonColor}
              >
                Lookup
              </IonButton>
            ) : null}
            {nextButton}
          </form>
          {querySuccess && !registrationExists ? (
            <p className="small-text">
              {" "}
              Respondent {participant.participantId} Lookup Successful
            </p>
          ) : null}
          <IonToast
            isOpen={
              querySuccess !== undefined &&
              querySuccess !== null &&
              !querySuccess
            }
            color={"dark"}
            duration={3000}
            message=" Respondent Lookup Failed"
            onDidDismiss={this.resetState}
            buttons={[
              {
                text: "x",
                role: "cancel",
              },
            ]}
          />

          <IonToast
            isOpen={registrationExists}
            color={"dark"}
            duration={3000}
            message="Participant is already registered, please contact your system administrator"
            onDidDismiss={this.resetState}
            buttons={[
              {
                text: "x",
                role: "cancel",
              },
            ]}
          />
        </IonContent>
      </IonPage>
    );
  };
}

export default ParticipantLookup;
