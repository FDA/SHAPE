import React, { Component } from "react";
import {
  IonCol,
  IonContent,
  IonDatetime,
  IonGrid,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {
  assessmentArr,
  GMFCArr,
  treatmentVals,
  deviceVals,
} from "./DiaryMappings";

import "../Diary.css";
import { isEmptyObject } from "../../../../utils/Utils";
import { dateFormats, diaryViews } from "../../../../utils/Constants";
import { format } from "date-fns";
import { CustomDropdown, Footer } from "./components";
import { Participant } from "../../../../interfaces/DataTypes";

interface DrVisitProps {
  setView: Function;
  submitDiary: Function;
  getDiaryEntries: Function;
  profile: Participant;
  surveyId: string;
  profileName: string;
  profileDOB: string;
}

interface DrVisitState {
  formType: string;
  assessers: Array<number>;
  assesserText: string;
  GMFCScore: string;
  GMFCType: number | null;
  eventDate: string;
  visitReason: string;
  prescription: number | null;
  device: number | null;
  error: boolean;
}

class DoctorVisit extends Component<DrVisitProps, DrVisitState> {
  constructor(props: DrVisitProps) {
    super(props);
    this.state = {
      formType: "Clinical Visit",
      assessers: [],
      assesserText: "",
      GMFCScore: "",
      GMFCType: null,
      eventDate: "",
      visitReason: "",
      prescription: null,
      device: null,
      error: false,
    };
  }

  // accepts any type because this function is being reused for many tpyes of inputs
  handleInputChange = (e: any) => {
    let key = e.target.name;
    let value = e.target.value;

    if (key === "step" && e.target.value === 0) return;
    if (key === "eventDate") {
      value = format(new Date(value), dateFormats.MMddyyyy);
    }

    if (Object.keys(this.state).includes(key)) {
      this.setState({
        [key]: value,
      } as Pick<DrVisitState, keyof DrVisitState>);
    }
  };

  handleSave = (e: any) => {
    let {
      eventDate,
      visitReason,
      assessers,
      assesserText,
      GMFCType,
      GMFCScore,
      prescription,
      device,
    } = this.state;
    let complete =
      !isEmptyObject(eventDate) &&
      !isEmptyObject(visitReason) &&
      !isEmptyObject(assessers) &&
      (assessers.indexOf(5) > -1 ? !isEmptyObject(assesserText) : true) &&
      !isEmptyObject(GMFCType) &&
      (GMFCType !== null && GMFCType < 3 ? !isEmptyObject(GMFCScore) : true) &&
      !isEmptyObject(prescription) &&
      !isEmptyObject(device);

    if (complete) {
      this.setState({ error: false });

      let context = {
        surveyId: this.props.surveyId,
        profileName: this.props.profileName,
        profileDOB: this.props.profileDOB,
        ...this.state,
      };

      delete context.error;

      this.props.submitDiary(context);
      let { participantId, org } = this.props.profile;
      this.props.getDiaryEntries(participantId, org);
      this.props.setView(diaryViews.SURVEYSELECTION);
    } else {
      this.setState({ error: true });
    }
  };

  render() {
    let {
      eventDate,
      assesserText,
      GMFCScore,
      GMFCType,
      visitReason,
      prescription,
    } = this.state;

    let showAssesserBox = this.state.assessers.includes(5);

    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Regular Clinical Visit</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonGrid>
            <IonRow className="form-row">
              <IonCol className="form-col">
                <IonItem lines="none">
                  <IonLabel position="stacked">
                    Date of Clinical Visit<IonText color="danger">*</IonText>
                  </IonLabel>
                  <IonDatetime
                    className="rounded-input"
                    displayFormat={dateFormats.MMDDYYYY}
                    placeholder="Select Date"
                    name="eventDate"
                    value={eventDate}
                    onIonChange={(e) => this.handleInputChange(e)}
                  />
                </IonItem>
              </IonCol>
            </IonRow>
            <IonRow className="form-row">
              <IonCol className="form-col">
                <IonItem
                  style={{
                    paddingBottom: "10px",
                  }}
                >
                  <IonLabel position="stacked">
                    Reason for Clinical Visit<IonText color="danger">*</IonText>
                  </IonLabel>
                  <IonTextarea
                    placeholder="Reason for visit."
                    className="form-textbox"
                    name="visitReason"
                    value={visitReason}
                    rows={4}
                    cols={20}
                    onIonChange={(e) => this.handleInputChange(e)}
                  />
                </IonItem>
              </IonCol>
            </IonRow>
            <IonRow className="form-row">
              <IonCol className="form-col">
                <IonItem lines="none">
                  <IonLabel className="ion-text-wrap" position="stacked">
                    Who conducted the assessment? Mark all that apply
                    <IonText color="danger">*</IonText>
                  </IonLabel>
                  <IonSelect
                    multiple={true}
                    className="rounded-input"
                    name="assessers"
                    onIonChange={(e) => this.handleInputChange(e)}
                  >
                    {assessmentArr.map((str) => {
                      return (
                        <IonSelectOption key={str.val} value={str.val}>
                          {str.text}
                        </IonSelectOption>
                      );
                    })}
                  </IonSelect>
                </IonItem>
              </IonCol>
            </IonRow>
            {showAssesserBox && (
              <IonRow className="form-row">
                <IonCol className="form-col">
                  <IonItem lines="none">
                    <IonLabel position="stacked">
                      Specify Assesser<IonText color="danger">*</IonText>
                    </IonLabel>
                    <IonInput
                      className="rounded-input"
                      value={assesserText}
                      placeholder="Name"
                      name="assesserText"
                      onIonChange={(e) => this.handleInputChange(e)}
                    />
                  </IonItem>
                </IonCol>
              </IonRow>
            )}
            <IonRow className="form-row">
              <IonCol className="form-col">
                <CustomDropdown
                  label="Which Gross Motor Function assessment did the provider use?"
                  name="GMFCType"
                  value={GMFCType}
                  handleInputChange={this.handleInputChange}
                  optionsArr={GMFCArr}
                />
              </IonCol>
            </IonRow>
            {GMFCType !== null && GMFCType < 3 && (
              <IonRow className="form-row">
                <IonCol className="form-col">
                  <IonItem lines="none">
                    <IonLabel className="ion-text-wrap" position="stacked">
                      Please record the Gross Motor Function Score
                      <IonText color="danger">*</IonText>
                    </IonLabel>
                    <IonInput
                      className="rounded-input"
                      value={GMFCScore}
                      placeholder="Score"
                      name="GMFCScore"
                      onIonChange={(e) => this.handleInputChange(e)}
                    />
                  </IonItem>
                </IonCol>
              </IonRow>
            )}
            <IonRow className="form-row">
              <IonCol className="form-col">
                <CustomDropdown
                  label="What treatment was prescribed for the event?"
                  name="prescription"
                  value={prescription}
                  handleInputChange={(e: any) => this.handleInputChange(e)}
                  optionsArr={treatmentVals}
                />
              </IonCol>
            </IonRow>
            <IonRow className="form-row">
              <IonCol className="form-col">
                <IonItem lines="none">
                  <IonLabel className="ion-text-wrap" position="stacked">
                    What medical or assistive devices does the Participant use
                    to help move around, communicate, or do things? Mark all
                    that apply<IonText color="danger">*</IonText>
                  </IonLabel>

                  <IonSelect
                    multiple={true}
                    className="rounded-input"
                    name="device"
                    onIonChange={(e) => this.handleInputChange(e)}
                  >
                    {deviceVals.map((str) => {
                      return (
                        <IonSelectOption key={str.val} value={str.val}>
                          {str.text}
                        </IonSelectOption>
                      );
                    })}
                  </IonSelect>
                </IonItem>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
        <Footer
          error={this.state.error}
          setView={this.props.setView}
          handleSave={this.handleSave}
        />
      </IonPage>
    );
  }
}

export default DoctorVisit;
