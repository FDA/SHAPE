import React, { Component } from "react";
import { IonContent, IonPage, IonFooter, IonToolbar } from "@ionic/react";
import AppHeader from "../../layout/AppHeader";
import Loading from "../../layout/Loading";
import EHRUploaderContainer from "./containers/EHRUploaderContainer";
import HealthRecord from "./HealthRecord";
import { RouteComponentProps } from "react-router";
import { EHR, User, FirebaseAuth, Person } from "../../../interfaces/DataTypes";

interface PassedProps extends RouteComponentProps {
  ehr: any;
  selected: EHR;
  fetchPatientEHR: Function;
  loading: boolean;
  profile: User;
  fireBaseAuth: FirebaseAuth;
  selectedProfile: Person;
}

interface LinkPatientEhrState {
  patientId: string;
}

class LinkPatientEHR extends Component<PassedProps, LinkPatientEhrState> {
  constructor(props: PassedProps) {
    super(props);
    this.state = { patientId: "" };
  }

  componentDidMount(): void {
    const { match, ehr } = this.props;
    //@ts-ignore
    const patientId: string = match.params.patientId;
    this.setState({ patientId: patientId });
    this.props.fetchPatientEHR(patientId, ehr);
  }

  render() {
    const { loading, ehr, profile, fireBaseAuth, selectedProfile } = this.props;
    const { patientId } = this.state;
    const { healthRecord, selected } = ehr;
    const isHealthRecordLoaded = healthRecord ? true : false;
    const loadingIndicator = loading ? <Loading /> : null;

    return (
      <IonPage>
        {loadingIndicator}
        <AppHeader showHeader={true} text={"Health Records"} />
        <IonContent>
          {isHealthRecordLoaded && (
            <span>
              <HealthRecord data={healthRecord} />
            </span>
          )}
        </IonContent>
        <IonFooter>
          <IonToolbar className="ion-no-border">
            <EHRUploaderContainer
              data={healthRecord}
              profile={profile}
              selectedEHR={selected}
              patientId={patientId}
              uid={fireBaseAuth.uid}
              selectedProfile={selectedProfile}
            />
          </IonToolbar>
        </IonFooter>
      </IonPage>
    );
  }
}

export default LinkPatientEHR;
