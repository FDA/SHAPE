import React, { Component, ReactNode } from "react";
import AppHeader from "../layout/AppHeader";
import {
  IonCol,
  IonContent,
  IonGrid,
  IonPage,
  IonRow,
  IonText,
} from "@ionic/react";
import { RouteComponentProps } from "react-router-dom";
import {
  User,
  FirebaseAuth,
  ParticipantResponse,
  Questionnaire,
} from "../../interfaces/DataTypes";
import { NoDataCard, Q13Card } from "./components";
import { isEmptyObject } from "../../utils/Utils";
import { routes } from "../../utils/Constants";

interface PassedProps extends RouteComponentProps {
  profile: User;
  fireBaseAuth: FirebaseAuth;
  getAllPreviewQuestionnaires: Function;
  getQuestionnaires: Function;
  questionnaires: Array<Questionnaire>;
  participantResponse: Array<ParticipantResponse>;
}

interface ChooseQuestionnaireState {
  surveyId: string;
}

class ChooseQuestionnaire extends Component<
  PassedProps,
  ChooseQuestionnaireState
> {
  constructor(props: PassedProps) {
    super(props);
    this.state = { surveyId: "" };
  }

  componentDidMount(): void {
    const { match, profile } = this.props;
    const { participantId, org } = profile;
    //@ts-ignore
    let { previewmode } = this.props.match.params;
    //@ts-ignore
    const surveyId: string = match.params.id;
    this.setState({ surveyId: surveyId });
    const { isEmpty } = this.props.fireBaseAuth;
    if (!isEmpty) {
      if (previewmode) {
        this.props.getAllPreviewQuestionnaires(surveyId, participantId);
      } else {
        this.props.getQuestionnaires(participantId, org);
      }
    }
  }

  render() {
    const { surveyId } = this.state;
    const { questionnaires, participantResponse } = this.props;
    //@ts-ignore
    let { previewmode, token } = this.props.match.params;
    let displayData: ReactNode = <NoDataCard />;
    if (!isEmptyObject(surveyId) && questionnaires) {
      let rowData = questionnaires
        .filter((q: Questionnaire) => {
          return (
            q.open !== undefined && q.open === true && q.surveyId === surveyId
          );
        })
        .sort((a: Questionnaire, b: Questionnaire) =>
          a.dateCreated < b.dateCreated ? 1 : -1
        );
      if (rowData.length > 0) {
        displayData = rowData.map((questionnaire: Questionnaire) => {
          let hrefUrl = "";
          if (previewmode) {
            hrefUrl = `${routes.PREVIEW_QUESTIONNAIRE}/survey/${surveyId}/questionnaire/${questionnaire.id}/token/${token}`;
          } else {
            hrefUrl = `${routes.SURVEY}/${surveyId}/questionnaire/${questionnaire.id}`;
          }
          let numQuestions = questionnaire.questions.length;
          return (
            <IonRow key={questionnaire.id}>
              <IonCol>
                <Q13Card
                  id={questionnaire.id}
                  href={hrefUrl}
                  name={questionnaire.name}
                  description={questionnaire.description}
                  shortDescription={questionnaire.shortDescription}
                  participantResponse={participantResponse}
                  numQuestions={numQuestions}
                />
              </IonCol>
            </IonRow>
          );
        });
      }
    }

    return (
      <IonPage>
        <AppHeader showHeader={true} text={"Select Questionnaire"} />
        <IonContent className="ion-padding">
          <IonText>
            <h1>Choose Questionnaire</h1>
          </IonText>
          <IonText color="dark">
            Please choose the questionnaire you are answering questions for.
          </IonText>
          <IonGrid>{displayData}</IonGrid>
        </IonContent>
      </IonPage>
    );
  }
}

export default ChooseQuestionnaire;
