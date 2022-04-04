import React, { Component, ReactNode } from "react";
import {
  IonButton,
  IonContent,
  IonLoading,
  IonPage,
  IonText,
  IonToast,
} from "@ionic/react";
import QuestionEngine from "../../question/engine/QuestionEngine";
import { FirebaseAuth, User } from "../../interfaces/DataTypes";
import { Questionnaire, Profile } from "../../question/interfaces";
import { Context } from "../../question/engine/Context";
import AppHeader from "../layout/AppHeader";
import { RouteComponentProps } from "react-router";
import { isEmptyObject } from "../../utils/Utils";
import { routes } from "../../utils/Constants";

const NEXT = "next";

interface PassedProps extends RouteComponentProps {
  fireBaseAuth: FirebaseAuth;
  getOnePreviewQuestionnaire: Function;
  resetQuestionnaire: Function;
  isLoading: Function;
  questionnaire: any;
  previewAuthentication: Function;
  answerQuestion: Function;
  logout: Function;
  pushQuestion: Function;
  popQuestion: Function;
  selectedProfile: Profile;
  profile: User;
  questionnaires: Array<Questionnaire>;
}

interface QuestionnairePreviewState {
  question: null | ReactNode;
  completed: boolean;
  surveyId: string;
  questionnaireId: string;
  engine: any;
  validationError: string;
  isReady: boolean;
  goHome: boolean;
}

class QuestionnairePreview extends Component<
  PassedProps,
  QuestionnairePreviewState
> {
  constructor(props: any) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      question: null,
      completed: false,
      surveyId: props.match.params.surveyId,
      questionnaireId: props.match.params.id,
      engine: null,
      validationError: "",
      isReady: false,
      goHome: false,
    };
  }

  setupAuth = () => {
    //@ts-ignore
    let { token } = this.props.match.params;
    let decoded_token = JSON.parse(atob(token));
    return this.props.previewAuthentication(decoded_token);
  };

  componentDidMount(): void {
    this.loadPreview();
    this.props.resetQuestionnaire();
    this.props.isLoading(false);
  }

  loadPreview = () => {
    let self = this;
    //@ts-ignore
    let { id, surveyId } = this.props.match.params;
    let { questionnaireId } = this.state;
    //@ts-ignore
    let { token } = this.props.match.params;
    let decoded_token = JSON.parse(atob(token));

    this.props.getOnePreviewQuestionnaire(id, decoded_token);
    setTimeout(() => {
      self.clearQuestionnaire();
      self.setupEngine(surveyId, questionnaireId, id);
      this.setState({ isReady: true });
    }, 1000);
  };

  clearQuestionnaire = () => {
    let { questionnaire } = this.props;
    for (var key of Object.keys(questionnaire)) {
      let entry = questionnaire[key];
      switch (typeof entry) {
        case "number":
          questionnaire[key] = null;
          break;
        case "string":
          questionnaire[key] = "";
          break;
        case "object":
          for (let current of entry) {
            if (typeof current === "object" && current !== null) {
              delete current["isChecked"];
            }
          }
          break;
        default:
          break;
      }
    }
  };

  handleChange(event: any) {
    const { name, value } = event.target;
    this.props.answerQuestion({ [name]: value });
  }

  clearValue = () => {
    return null;
  };

  getValue = (direction: string) => {
    var retVal = null;
    if (this.state) {
      const { engine } = this.state;
      const question =
        direction === NEXT
          ? engine.peekNextQuestion()
          : engine.peekPreviousQuestion();
      const { questionnaire } = this.props;
      if (questionnaire && question) {
        const currentValue = questionnaire[question.name];
        if (currentValue !== undefined) {
          retVal = currentValue;
        }
      }
    }
    return retVal;
  };

  goHome = () => {
    this.props.history.push(routes.TABS);
  };

  completeQuestions = () => {
    let w = window.open("", "_self");
    if (w) {
      this.props.logout();
      w.close();
    }
  };

  shouldSkip = () => {
    let skipped = false;
    const { engine } = this.state;
    const currentAnswer = this.currentAnswerValue();
    const skipValue = engine.shouldSkip(currentAnswer);
    if (!isEmptyObject(skipValue)) {
      engine.setNextQuestion(skipValue);
      skipped = true;
    }
    return skipped;
  };

  isValid = (): boolean => {
    const { engine } = this.state;
    const currentAnswer = this.currentAnswerValue();
    const retVal = engine.isValid(currentAnswer);
    if (!retVal) {
      const message = engine.getCurrentMessage();
      this.setState({ validationError: message });
    }
    return retVal;
  };

  next = (e: any) => {
    if (!this.isValid()) {
      return;
    }
    const { engine } = this.state;
    const questionData = engine.peekCurrentQuestion();

    this.props.pushQuestion(questionData.name);
    let defaultValue;
    let currentQuestion;
    const skipTo = this.shouldSkip();
    if (skipTo) {
      defaultValue = this.currentAnswerValue();
      currentQuestion = engine.getCurrentQuestion(defaultValue);
    } else {
      defaultValue = this.getValue(NEXT);
      currentQuestion = engine.nextQuestion(defaultValue);
    }
    this.setState({ question: currentQuestion });
  };
  previous = () => {
    if (!this.isValid()) {
      return;
    }
    const { engine } = this.state;
    const { questionnaire } = this.props;
    const { questionStack } = questionnaire;
    const previousQuestion = questionStack[questionStack.length - 1];
    const defaultValue = questionnaire[previousQuestion];
    this.props.popQuestion();
    engine.setNextQuestion(previousQuestion);
    const currentQuestion = engine.getCurrentQuestion(defaultValue);
    this.setState({ question: currentQuestion });
  };

  currentAnswerValue = () => {
    const { engine } = this.state;
    const { questionnaire } = this.props;
    const questionData = engine.peekCurrentQuestion();
    var currentAnswer = null;
    if (questionnaire && questionData) {
      currentAnswer = questionnaire[questionData.name];
    }

    return currentAnswer;
  };

  setupEngine = (surveyId: string, questionnaireId: string, id: string) => {
    this.setState({ completed: false, goHome: false });
    const { questionnaire, selectedProfile } = this.props;
    const { profile } = this.props;
    const { participantId } = profile;
    const idx = this.props.questionnaires
      .map((q) => {
        return q.id;
      })
      .indexOf(questionnaireId);
    let model = this.props.questionnaires[idx];
    let engine = new QuestionEngine(
      model,
      this.handleChange,
      this.clearValue,
      this.currentAnswerValue
    );
    const questionData = engine.peekCurrentQuestion();
    let currentQuestion,
      currentAnswer = null;
    if (questionnaire && questionData) {
      currentAnswer = questionnaire[questionData.name];
      currentQuestion = engine.getCurrentQuestion(currentAnswer);
    }
    const context = new Context(
      surveyId,
      participantId,
      questionnaireId,
      selectedProfile,
      id
    );
    engine.context = context;
    engine.goToFirst();
    this.setState({ question: currentQuestion, engine: engine });
  };

  removeValidationError = () => {
    this.setState({ validationError: "" });
  };

  render() {
    const { engine, question, completed, validationError, isReady } =
      this.state;
    const { isEmpty } = this.props.fireBaseAuth;
    if (!engine) {
      return null;
    }
    const { hasNext, hasPrevious } = engine;
    const message = `Question ${engine.getCurrentIndex()} of ${engine.getQuestionsLen()}`;
    const buttonLabel = "Exit";
    const isInvalid = !isEmptyObject(validationError) ? true : false;
    return (
      <IonPage>
        <AppHeader showHeader={!isEmpty} />
        <IonContent className="ion-padding">
          <IonLoading isOpen={!isReady} message={"Loading..."} />
          <IonText>
            <h4>Answering on behalf of Previewer</h4>
          </IonText>
          {question}
          {hasPrevious && (
            <IonButton expand="block" onClick={this.previous}>
              Previous
            </IonButton>
          )}
          {hasNext && (
            <IonButton expand="block" onClick={(e: any) => this.next(e)}>
              Next
            </IonButton>
          )}
          <IonButton expand="block" onClick={this.completeQuestions}>
            {buttonLabel}
          </IonButton>
          <IonText>
            <h3>{message}</h3>
          </IonText>
          <IonToast
            isOpen={completed}
            color={"success"}
            duration={2000}
            message=" The questionnaire responses have been saved."
            onDidDismiss={this.goHome}
            buttons={[
              {
                text: "x",
                role: "cancel",
              },
            ]}
          />
          {isInvalid && (
            <IonToast
              isOpen={true}
              color={"danger"}
              duration={2000}
              message={validationError}
              onDidDismiss={this.removeValidationError}
            />
          )}
        </IonContent>
      </IonPage>
    );
  }
}
// Connected Component
export default QuestionnairePreview;
