import React, { Component, ReactNode } from "react";
import { Redirect, RouteComponentProps } from "react-router-dom";
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonPage,
  IonTitle,
  IonToast,
  IonToolbar,
  IonHeader,
} from "@ionic/react";
import QuestionEngine from "../../question/engine/QuestionEngine";
import { FirebaseAuth, Participant } from "../../interfaces/DataTypes";
import { Questionnaire, Profile } from "../../question/interfaces";
import { Context } from "../../question/engine/Context";
import { isEmptyObject } from "../../utils/Utils";
import { routes } from "../../utils/Constants";

interface PassedProps extends RouteComponentProps {
  fireBaseAuth: FirebaseAuth;
  answerQuestion: Function;
  questionnaire: any;
  popQuestion: Function;
  completeQuestionnaire: Function;
  pushQuestion: Function;
  surveyId: string;
  selectedProfile: Profile;
  profile: Participant;
  questionnaires: Array<Questionnaire>;
  questionnaireId: string;
  id: string;
}

interface QuestionnaireInstanceState {
  engine: any;
  question: ReactNode | null;
  profileName: string;
  surveyId: string;
  questionnaireId: string;
  validationError: string;
}

const NEXT = "next";

class QuestionnaireInstance extends Component<
  PassedProps,
  QuestionnaireInstanceState
> {
  constructor(props: PassedProps) {
    super(props);
    this.state = {
      question: null,
      profileName: "",
      surveyId: "",
      questionnaireId: "",
      engine: null,
      validationError: "",
    };

    this.handleChange = this.handleChange.bind(this);
    this.clearValue = this.clearValue.bind(this);
    this.getValue = this.getValue.bind(this);
    this.goHome = this.goHome.bind(this);
    this.completeQuestions = this.completeQuestions.bind(this);
    this.shouldSkip = this.shouldSkip.bind(this);
    this.isValid = this.isValid.bind(this);
    this.next = this.next.bind(this);
    this.previous = this.previous.bind(this);
    this.currentAnswerValue = this.currentAnswerValue.bind(this);
    this.setupEngine = this.setupEngine.bind(this);
    this.removeValidationError = this.removeValidationError.bind(this);
  }

  componentDidUpdate(prevProps: any, prevState: any, snapshot: any) {
    if (
      this.props.selectedProfile.id !== prevProps.selectedProfile.id ||
      this.props.questionnaireId !== prevProps.questionnaireId
    ) {
      this.setupEngine();
    }
  }

  componentDidMount(): void {
    const { isEmpty } = this.props.fireBaseAuth;
    if (!isEmpty) this.setupEngine();
  }

  handleChange(event: any) {
    const { name, value } = event.target;
    this.props.answerQuestion({ [name]: value });
  }

  clearValue = (name: any) => {
    this.props.answerQuestion({ [name]: "" });
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

  goHome = (hasNext: boolean) => {
    let completeStatus = hasNext ? false : true;
    const { engine } = this.state;
    const { context } = engine;
    this.props.completeQuestionnaire(context, completeStatus);
    this.setupEngine();
    document.getElementById("tabBar")!.style.display = "flex";
    this.props.history.replace(routes.TAB1);
  };

  completeQuestions = (hasNext: boolean) => {
    if (this.isValid()) {
      this.goHome(hasNext);
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

  next = () => {
    if (!this.isValid()) {
      return;
    }
    try {
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
    } catch (error) {
      console.error(error);
    }
  };

  previous = () => {
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

  setupEngine = () => {
    const {
      surveyId,
      questionnaireId,
      questionnaire,
      selectedProfile,
      profile,
      id,
    } = this.props;
    const { participantId } = profile;
    const idx = this.props.questionnaires
      .map((q: Questionnaire) => {
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
    engine.context = new Context(
      surveyId,
      participantId,
      questionnaireId,
      selectedProfile,
      id
    );
    engine.goToFirst();
    this.setState({ question: currentQuestion, engine: engine });
  };

  removeValidationError = () => {
    this.setState({ validationError: "" });
  };

  render() {
    const { engine, question, validationError } = this.state;
    const { selectedProfile } = this.props;
    if (!engine) {
      return null;
    }
    const { isEmpty } = this.props.fireBaseAuth;
    if (isEmpty) {
      return <Redirect to={routes.LOGIN} />;
    }

    const { hasNext, hasPrevious } = engine;
    const message = `Question ${engine.getCurrentIndex()} of ${engine.getQuestionsLen()}`;
    const buttonLabel = !hasNext
      ? `Save and Complete`
      : `Save & Complete Later`;
    const isInvalid = !isEmptyObject(validationError);

    return (
      <IonPage>
        <IonHeader>
          <IonToolbar className="ion-no-border">
            <IonButtons slot="start">
              {hasPrevious && (
                <IonButton
                  fill={"clear"}
                  size={"small"}
                  onClick={this.previous}
                >
                  &lt; Back
                </IonButton>
              )}
            </IonButtons>
            <IonTitle>Questionnaire</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <p id="q13-profile">Answering on behalf of {selectedProfile.name}</p>
          {question}

          {isInvalid && (
            <IonToast
              isOpen={true}
              color={"danger"}
              duration={2000}
              message={validationError}
              onDidDismiss={this.removeValidationError}
              buttons={[
                {
                  text: "x",
                  role: "cancel",
                },
              ]}
            />
          )}
        </IonContent>
        <IonFooter className="ion-no-border">
          <IonToolbar>
            <p id="q13-progress-message">{message}</p>
            <IonButton
              expand="block"
              fill="solid"
              color="light"
              onClick={() => this.completeQuestions(hasNext)}
            >
              {buttonLabel}
            </IonButton>
            {hasNext && (
              <IonButton
                expand="block"
                fill="solid"
                color="primary"
                onClick={this.next}
              >
                Next
              </IonButton>
            )}
          </IonToolbar>
        </IonFooter>
      </IonPage>
    );
  }
}

export default QuestionnaireInstance;
