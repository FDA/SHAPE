import React from "react";
import {
  IonItem,
  IonPage,
  IonContent,
  IonCard,
  IonLabel,
  IonText,
  IonSelect,
  IonSelectOption,
  IonFooter,
  IonToolbar,
  IonButton,
} from "@ionic/react";
import AppHeader from "../../../layout/AppHeader";
import { diaryViews, routes } from "../../../../utils/Constants";
import { User, Person, Survey } from "../../../../interfaces/DataTypes";

interface PassedProps {
  surveySelection: Survey | null;
  handleSurveySelect: Function;
  handleNext: Function;
  profile: User;
  participant: Person;
  handleParticipantSelect: Function;
  surveys: Array<Survey>;
  view: string | null;
  handleViewSelect: Function;
}

export const CustomDropdown = (props: PassedProps) => {
  const {
    surveySelection,
    handleSurveySelect,
    handleNext,
    profile,
    participant,
    handleParticipantSelect,
    surveys,
    view,
    handleViewSelect,
  } = props;
  const profiles = profile.profiles;

  if (surveys.length) {
    return (
      <IonPage>
        <AppHeader showHeader={true} text={"New Self-Report"} />
        <IonContent className="ion-padding-horizontal">
          <IonCard>
            <IonItem lines="none">
              <IonLabel position="stacked">
                Select a Survey<IonText color="danger">*</IonText>
              </IonLabel>
              <IonSelect
                className="rounded-input"
                name={diaryViews.SURVEYSELECTION}
                value={surveySelection}
                okText="Ok"
                cancelText="Cancel"
                onIonChange={(e) => handleSurveySelect(e)}
              >
                {surveys.map((choice: Survey) => {
                  return (
                    <IonSelectOption
                      key={`${choice.id}`}
                      value={choice}
                    >
                      {`${choice.name}`}
                    </IonSelectOption>
                  );
                })}
              </IonSelect>
            </IonItem>
            <IonItem lines="none">
              <IonLabel position="stacked">
                Select a Participant<IonText color="danger">*</IonText>
              </IonLabel>
              <IonSelect
                className="rounded-input"
                name="participant"
                value={participant}
                okText="Ok"
                cancelText="Cancel"
                onIonChange={(e) => handleParticipantSelect(e)}
              >
                {profiles.map((p: Person) => {
                  return (
                    <IonSelectOption key={`${p.name}`} value={p}>
                      {`${p.name}(${p.gender}) - ${p.dob}`}
                    </IonSelectOption>
                  );
                })}
              </IonSelect>
            </IonItem>
            <IonItem lines="none">
              <IonLabel position="stacked">
                Select an Entry Type<IonText color="danger">*</IonText>
              </IonLabel>
              <IonSelect
                className="rounded-input"
                name="entryType"
                value={view}
                okText="Ok"
                cancelText="Cancel"
                onIonChange={(e) => handleViewSelect(e)}
              >
                <IonSelectOption
                  key={diaryViews.HEALTHEVENT}
                  value={`healthEvent`}
                >
                  {`Health Event`}
                </IonSelectOption>
                <IonSelectOption
                  key={diaryViews.CLINICALVISIT}
                  value={`clinicalVisit`}
                >
                  {`Clinical Encounter`}
                </IonSelectOption>
                <IonSelectOption
                  key={diaryViews.WITHDRAWAL}
                  value={`withdrawal`}
                >
                  {`Study Withdrawal`}
                </IonSelectOption>
              </IonSelect>
            </IonItem>
          </IonCard>
        </IonContent>

        <IonFooter className="ion-no-border">
          <IonToolbar>
            <IonButton
              expand="block"
              color="primary"
              onClick={(e) => handleNext(e)}
            >
              Next
            </IonButton>
          </IonToolbar>
        </IonFooter>
      </IonPage>
    );
  } else {
    return (
      <IonPage>
        <IonCard>
          <h1>No Surveys available for Diary Entry</h1>
          <IonButton routerLink={routes.DIARY}>Return</IonButton>
        </IonCard>
      </IonPage>
    );
  }
};
