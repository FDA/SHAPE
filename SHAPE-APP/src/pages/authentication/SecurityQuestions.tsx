import React, { Component, SyntheticEvent } from "react";
import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonToast,
} from "@ionic/react";
import Loading from "../layout/Loading";
import AppHeader from "../layout/AppHeader";
import { difference } from "../../utils/Utils";
import { Participant, SecurityQuestion } from "../../interfaces/DataTypes";
import { routes } from "../../utils/Constants";

interface PassedProps {
  participant: Participant;
  isLoading: boolean;
  resetparticipantLookup: Function;
}

interface SecurityQuestionsState {
  answers: any;
  userVerified: boolean | null;
}

class SecurityQuestions extends Component<PassedProps, SecurityQuestionsState> {
  constructor(props: PassedProps) {
    super(props);
    this.state = {
      answers: {},
      userVerified: null,
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps: Readonly<PassedProps>): void {
    const diff = difference(nextProps, this.props);
    const { location } = diff;
    if (location && location.pathname === routes.SECURITY_QUESTIONS) {
      this.setState({ answers: {}, userVerified: null });
    }
  }

  handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    const { participant } = this.props;
    const answeredQuestions: Array<SecurityQuestion> = [];
    Object.entries(this.state.answers).forEach(
      ([key, value]: [string, any]) => {
        const question: SecurityQuestion = { answer: value, question: key };
        answeredQuestions.push(question);
      }
    );
    const diff = difference(participant.securityQuestions, answeredQuestions);
    if (Array.isArray(diff) && diff.length === 0) {
      this.setState({
        userVerified: true,
      });
    } else {
      this.setState({
        userVerified: false,
      });
    }
  };

  resetState = () => {
    this.setState({ userVerified: null });
  };

  handleChange = (event: CustomEvent<KeyboardEvent>) => {
    const { name, value } = event.target as HTMLInputElement;
    const { answers } = this.state;
    this.setState({
      answers: {
        ...answers,
        [name]: value,
      },
    });
  };

  render = () => {
    const { isLoading, participant } = this.props;
    const { userVerified } = this.state;
    const { securityQuestions } = participant;
    if (!securityQuestions) {
      return null;
    }
    const LoadingIndicator = isLoading ? <Loading /> : null;
    let { answers } = this.state;

    let formControls = participant.securityQuestions.map(
      (question: SecurityQuestion, index: number) => {
        if (answers && answers.answers) {
          answers = answers.answers;
        }

        let val = answers[question.question];
        return (
          <IonItem key={question.question}>
            <IonLabel
              position="stacked"
              className="ion-text-wrap ion-diagnostic-stack-header"
            >
              {question.question}
            </IonLabel>
            <IonInput
              name={question.question}
              required={true}
              value={val}
              onIonInput={(e) => this.handleChange(e)}
            />
          </IonItem>
        );
      }
    );

    const nextButton = userVerified ? (
      <IonButton
        expand="block"
        fill="solid"
        id="sq-next-button"
        routerLink={routes.PARTICIPANT_ADD}
        color="primary"
      >
        Next
      </IonButton>
    ) : null;

    return (
      <IonPage>
        <AppHeader showHeader={true} text={"Security Questions"} />
        <IonContent className="ion-padding">
          {LoadingIndicator}
          <p className="hero-text">
            For your security, please answer the security questions you have
            previously stated.
          </p>
          <p className="small-text">
            All answers are case sensitive and must match your registered
            self-identified questions
          </p>
          <form onSubmit={(e) => this.handleSubmit(e)}>
            {formControls}
            <IonButton
              id="reset-button"
              routerLink={routes.LOGIN_CARD}
              fill="solid"
              style={{ marginTop: ".5em" }}
              expand="block"
              type="button"
              color="light"
              onClick={(e) => {
                this.props.resetparticipantLookup();
              }}
            >
              Start Over
            </IonButton>
            {nextButton}
            {!userVerified && (
              <IonButton
                fill="solid"
                style={{ marginTop: ".5em" }}
                expand="block"
                type="submit"
                id="submit"
                color="primary"
              >
                Check Answers
              </IonButton>
            )}
          </form>
          <IonToast
            id="validation-error-toast"
            isOpen={
              userVerified !== undefined &&
              userVerified !== null &&
              !userVerified
            }
            color={"dark"}
            duration={3000}
            message="Your answers do not match answers on file. Please contact support for help"
            onDidDismiss={this.resetState}
            buttons={[
              {
                text: "x",
                role: "cancel",
              },
            ]}
          />
          <IonToast
            id="validation-success-toast"
            isOpen={
              userVerified !== undefined &&
              userVerified !== null &&
              userVerified
            }
            color={"success"}
            duration={3000}
            message="You have been verified, proceed to registration."
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

export default SecurityQuestions;
