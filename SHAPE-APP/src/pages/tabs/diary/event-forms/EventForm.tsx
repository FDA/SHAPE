import React, { Component } from "react";
import {
  IonToolbar,
  IonItem,
  IonLabel,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  IonInput,
  IonDatetime,
  IonTitle,
  IonPage,
  IonHeader,
  IonContent,
} from "@ionic/react";
import { format } from "date-fns";

import { isEmptyObject } from "../../../../utils/Utils";
import { diaryViews, dateFormats } from "../../../../utils/Constants";
import {
  CustomDropdown,
  DescriptionSection,
  HealthEvent,
  OngoingEvent,
  Footer,
} from "./components";
import { outcomeChoices, treatmentChoices } from "./DiaryMappings";
import { Participant } from "../../../../interfaces/DataTypes";

import "../Diary.css";

interface EventFormProps {
  setView: Function;
  submitDiary: Function;
  getDiaryEntries: Function;
  profile: Participant;
  surveyId: string;
  profileName: string;
  profileDOB: string;
}

interface EventFormState {
  formType: string;
  onsetDate: string;
  endDate: string;
  ongoingStatus: number | null;
  descriptionData: string;
  healthEvent: number | null;
  healthEventSpecification: string;
  outcome: number | null;
  outcomeSpecification: string;
  eventTreatment: string;
  postEventTreatment: string;
  error: boolean;
}

class EventForm extends Component<EventFormProps, EventFormState> {
  constructor(props: EventFormProps) {
    super(props);
    this.state = {
      formType: "Health Event",
      healthEvent: null,
      healthEventSpecification: "",
      onsetDate: "",
      endDate: "",
      ongoingStatus: null,
      descriptionData: "",
      outcome: null,
      outcomeSpecification: "",
      eventTreatment: "",
      postEventTreatment: "",
      error: false,
    };
  }

  handleInputChange = (e: any) => {
    let key = e.target.name;
    let value = e.target.value;

    if (key === "step" && e.target.value === 0) return;
    if (key === "onsetDate" || key === "endDate") {
      value = format(new Date(value), dateFormats.MMddyyyy);
    }

    if (Object.keys(this.state).includes(key)) {
      this.setState({
        [key]: value,
      } as Pick<EventFormState, keyof EventFormState>);
    }
  };

  handleSave = () => {
    let {
      healthEvent,
      healthEventSpecification,
      onsetDate,
      endDate,
      ongoingStatus,
      descriptionData,
      outcome,
      outcomeSpecification,
      eventTreatment,
      postEventTreatment,
    } = this.state;

    let complete =
      !isEmptyObject(healthEvent) &&
      (healthEvent === 10 ? !isEmptyObject(healthEventSpecification) : true) &&
      !isEmptyObject(descriptionData) &&
      !isEmptyObject(onsetDate) &&
      !isEmptyObject(ongoingStatus) &&
      (ongoingStatus === 1 ? !isEmptyObject(endDate) : true) &&
      !isEmptyObject(outcome) &&
      (outcome === 7 ? !isEmptyObject(outcomeSpecification) : true) &&
      !isEmptyObject(eventTreatment) &&
      !isEmptyObject(postEventTreatment);

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
    let { onsetDate } = this.state;

    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Health Event</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonGrid>
            <IonRow className="form-row">
              <IonCol className="form-col">
                <HealthEvent
                  handleInputChange={this.handleInputChange}
                  value={this.state.healthEvent}
                  healthEventSpecification={this.state.healthEventSpecification}
                />
              </IonCol>
            </IonRow>
            <IonRow className="form-row">
              <IonCol className="form-col">
                <DescriptionSection
                  handleInputChange={this.handleInputChange}
                  value={this.state.descriptionData}
                />
              </IonCol>
            </IonRow>
            <IonRow className="form-row">
              <IonCol className="form-col">
                <IonItem lines="none">
                  <IonLabel position="stacked">
                    Onset Date of Event<IonText color="danger">*</IonText>
                  </IonLabel>
                  <IonDatetime
                    className="rounded-input"
                    displayFormat={dateFormats.MMDDYYYY}
                    placeholder="Select Date"
                    name="onsetDate"
                    value={onsetDate}
                    onIonChange={(e) => this.handleInputChange(e)}
                  />
                </IonItem>
              </IonCol>
            </IonRow>
            <IonRow className="form-row">
              <IonCol className="form-col">
                <OngoingEvent
                  handleInputChange={this.handleInputChange}
                  value={this.state.ongoingStatus}
                />
              </IonCol>
            </IonRow>
            {this.state.ongoingStatus === 1 && (
              <IonRow className="form-row">
                <IonCol className="form-col">
                  <IonItem lines="none">
                    <IonLabel position="stacked">
                      End Date of Event<IonText color="danger">*</IonText>
                    </IonLabel>
                    <IonDatetime
                      className="rounded-input"
                      displayFormat={dateFormats.MMDDYYYY}
                      placeholder="Select Date"
                      name="endDate"
                      value={this.state.endDate}
                      onIonChange={(e) => this.handleInputChange(e)}
                    />
                  </IonItem>
                </IonCol>
              </IonRow>
            )}
            <IonRow className="form-row">
              <IonCol className="form-col">
                <CustomDropdown
                  label="Outcome of Event"
                  name="outcome"
                  value={this.state.outcome}
                  handleInputChange={this.handleInputChange}
                  optionsArr={outcomeChoices}
                />
              </IonCol>
            </IonRow>
            {this.state.outcome === 7 && (
              <IonRow className="form-row">
                <IonCol className="form-col">
                  <IonItem lines="none">
                    <IonLabel position="stacked">
                      Outcome Specification
                      <IonText color="danger">*</IonText>
                    </IonLabel>
                    <IonInput
                      className="rounded-input"
                      value={this.state.outcomeSpecification}
                      onIonChange={this.handleInputChange}
                      name="outcomeSpecification"
                    />
                  </IonItem>
                </IonCol>
              </IonRow>
            )}
            <IonRow className="form-row">
              <IonCol className="form-col">
                <CustomDropdown
                  label="Treatment prescribed during Event"
                  name="eventTreatment"
                  value={this.state.eventTreatment}
                  handleInputChange={this.handleInputChange}
                  optionsArr={treatmentChoices}
                />
              </IonCol>
            </IonRow>
            <IonRow className="form-row">
              <IonCol className="form-col">
                <CustomDropdown
                  label="Treatment prescribed after Event"
                  name="postEventTreatment"
                  value={this.state.postEventTreatment}
                  handleInputChange={this.handleInputChange}
                  optionsArr={treatmentChoices}
                />
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

export default EventForm;
