import React, { Component } from "react";
import { IonButton, IonToast, IonSelect, IonSelectOption, IonItem, IonLabel, IonText } from "@ionic/react";
import Loading from "../../layout/Loading";
import { routes } from "../../../utils/Constants";
import { User, Person, EHR, Survey } from "../../../interfaces/DataTypes";
import AddFile from "./AddFile";
import { isEmptyObject } from "../../../utils/Utils";

interface PassedProps {
  profile: User;
  uid: string;
  selectedEHR: EHR;
  patientId: string;
  selectedProfile: Person;
  setEHR: Function;
  toggleLoading: Function;
  loading: boolean;
  data: any;
  resetEHR: Function;
  surveys: Array<Survey>
}

interface EHRUploaderState {
  done: boolean;
  survey: Survey | null;
}

class EHRUploader extends Component<PassedProps, EHRUploaderState> {
  constructor(props: PassedProps) {
    super(props);
    this.state = { 
      done: false, 
      survey: null, 
    };
  }

  setDone = (done: boolean) => {
    this.setState({ done: done });
  };

  setSurvey = (survey: Survey) => {
    this.setState({survey: survey});
  }

  render() {
    const {
      loading,
      profile,
      uid,
      selectedEHR,
      patientId,
      selectedProfile,
      setEHR,
      toggleLoading,
      data,
      resetEHR,
      surveys
    } = this.props;
    const { done, survey } = this.state;

    const butnLabel = !done ? "Quit without continuing" : "Home";
    return (
      <>
        {loading ? <Loading /> : null}
        {!done && (
          <>
          <IonItem color="secondary">
            <IonLabel position="stacked">
              Select a Survey for Data Share<IonText color="danger">*</IonText>
            </IonLabel>
            <IonSelect
              data-testid="org-select"
              className="rounded-input"
              name={`orgSelect`}
              okText="Ok"
              cancelText="Cancel"
              onIonChange={(e:any) => this.setSurvey(e.target.value)}
              value={survey}
            >
              {surveys.map((choice) => {
                return (
                    <IonSelectOption key={choice.id} value={choice}>
                    {`${choice.name}`}
                    </IonSelectOption>
                );
              })}
            </IonSelect>
          </IonItem>
          <AddFile
            disabled={isEmptyObject(survey)}
            selectedSurvey={survey}
            setDone={this.setDone}
            profile={profile}
            uid={uid}
            selectedEHR={selectedEHR}
            patientId={patientId}
            selectedProfile={selectedProfile}
            setEHR={setEHR}
            toggleLoading={toggleLoading}
            loading={loading}
            data={data}
            resetEHR={resetEHR}
          />
          </>
        )}
        <IonButton
          id="complete"
          fill="solid"
          expand="block"
          routerLink={routes.TABS}
          color="light"
        >
          {butnLabel}
        </IonButton>
        <IonToast
          isOpen={done}
          color={"success"}
          duration={2000}
          message={"Your EHR Records have been successfully submitted"}
        />
      </>
    );
  }
}

export default EHRUploader;
