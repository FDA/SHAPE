import React, { Component, SyntheticEvent } from "react";
import { Redirect, RouteComponentProps } from "react-router-dom";
import {
  IonButton,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonText,
} from "@ionic/react";
import {
  Person,
  ParticipantResponse,
  FirebaseAuth,
  Questionnaire,
  User,
} from "../../interfaces/DataTypes";
import AppHeader from "../layout/AppHeader";
import { personSharp } from "ionicons/icons";
import { routes } from "../../utils/Constants";

interface PassedProps extends RouteComponentProps {
  questionnaires: Array<Questionnaire>;
  profile: User;
  participantResponse: ParticipantResponse;
  setActiveProfile: Function;
  initializeQuestionnaire: Function;
  fireBaseAuth: FirebaseAuth;
}

interface ChooseProfileState {
  surveyId: string;
  questionnaireId: string;
}

class ChooseProfile extends Component<PassedProps, ChooseProfileState> {
  constructor(props: PassedProps) {
    super(props);
    this.state = {
      //@ts-ignore
      surveyId: props.match.params.id,
      //@ts-ignore
      questionnaireId: props.match.params.q13id,
    };
  }

  UNSAFE_componentWillReceiveProps(
    nextProps: Readonly<PassedProps>,
    nextContext: PassedProps
  ): void {
    this.setState({
      //@ts-ignore
      surveyId: nextProps.match.params.id,
      //@ts-ignore
      questionnaireId: nextProps.match.params.q13id,
    });
  }

  onClick = (
    event: SyntheticEvent,
    participantProfile: Person,
    hrefUrl: string
  ): void => {
    event.preventDefault();
    const { questionnaireId, surveyId } = this.state;
    const { questionnaires } = this.props;
    const selected = questionnaires.find((ele: Questionnaire) => {
      return ele.id === questionnaireId;
    });
    if (selected) {
      const { profile, participantResponse } = this.props;
      const target = {
        surveyId: surveyId,
        questionnaireId: questionnaireId,
        participantId: profile.participantId,
        profileName: participantProfile.name,
      };
      this.props.setActiveProfile(participantProfile);
      this.props.initializeQuestionnaire(target, participantResponse);

      this.props.history.push(hrefUrl);
      document.getElementById("tabBar")!.style.display = "none";
    }
  };

  render() {
    const { isEmpty } = this.props.fireBaseAuth;
    const { questionnaireId, surveyId } = this.state;
    const { profile } = this.props;
    if (isEmpty) return <Redirect to={routes.LOGIN} />;
    return (
      <IonPage>
        <AppHeader showHeader={true} text={"Select Participant"} />
        <IonContent className="ion-padding">
          <IonText>
            <h1>Choose Participant</h1>
          </IonText>
          <IonText color="dark">
            Please choose the participant profile you are answering questions on
            behalf of.
          </IonText>
          <IonList>
            {profile.profiles &&
              profile.profiles.map((participantProfile: Person) => {
                const hrefUrl = `${routes.DO_QUESTIONNAIRE}/survey/${surveyId}/questionnaire/${questionnaireId}`;
                return (
                  <IonItem
                    key={participantProfile.name}
                    detail={true}
                    onClick={(e: any) =>
                      this.onClick(e, participantProfile, hrefUrl)
                    }
                    routerLink={hrefUrl}
                  >
                    <IonLabel>
                      <IonIcon
                        icon={personSharp}
                        style={{ float: "left", marginRight: "8px", zoom: 2.0 }}
                      />
                      <h1>{participantProfile.name}</h1>
                      <div style={{ padding: "2px" }}>
                        Gender: {participantProfile.gender}
                      </div>
                      <div style={{ padding: "2px" }}>
                        DOB:{participantProfile.dob}
                      </div>
                    </IonLabel>
                  </IonItem>
                );
              })}
          </IonList>
          <IonButton
            routerLink={routes.TABS}
            style={{ marginTop: ".5em" }}
            expand="block"
            fill="solid"
            type="button"
            color="light"
          >
            Start over
          </IonButton>
        </IonContent>
      </IonPage>
    );
  }
}

export default ChooseProfile;
