import React, { Component } from "react";
import {
  IonToolbar,
  IonItem,
  IonLabel,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  IonDatetime,
  IonTitle,
  IonPage,
  IonHeader,
  IonContent,
} from "@ionic/react";
import "../Diary.css";
import { isEmptyObject } from "../../../../utils/Utils";
import { diaryViews, dateFormats } from "../../../../utils/Constants";
import { WithdrawalReason, Footer } from "./components";
import { Participant } from "../../../../interfaces/DataTypes";

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
  withdrawalDate: string;
  withdrawalReason: string;
  error: boolean;
}

class Withdrawal extends Component<EventFormProps, EventFormState> {
  constructor(props: EventFormProps) {
    super(props);
    this.state = {
      formType: "Withdrawal",
      withdrawalDate: "",
      withdrawalReason: "",
      error: false,
    };
  }

  handleInputChange = (e: any) => {
    let key = e.target.name;
    let value = e.target.value;

    if (Object.keys(this.state).includes(key)) {
      this.setState({
        [key]: value,
      } as Pick<EventFormState, keyof EventFormState>);
    }
  };

  handleSave = (e: any) => {
    let { withdrawalDate, withdrawalReason } = this.state;
    let complete =
      !isEmptyObject(withdrawalDate) && !isEmptyObject(withdrawalReason);

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
    let { withdrawalDate, withdrawalReason } = this.state;

    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Withdrawal</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonGrid>
            <IonRow className="form-row">
              <IonCol className="form-col">
                <IonItem lines="none">
                  <IonLabel position="stacked">
                    Date of Withdrawal<IonText color="danger">*</IonText>
                  </IonLabel>
                  <IonDatetime
                    className="rounded-input"
                    displayFormat={dateFormats.MMDDYYYY}
                    placeholder="Select Date"
                    name="withdrawalDate"
                    value={withdrawalDate}
                    onIonChange={(e) => this.handleInputChange(e)}
                  />
                </IonItem>
              </IonCol>
            </IonRow>
            <IonRow className="form-row">
              <IonCol className="form-col">
                <WithdrawalReason
                  handleInputChange={this.handleInputChange}
                  value={withdrawalReason}
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

export default Withdrawal;
