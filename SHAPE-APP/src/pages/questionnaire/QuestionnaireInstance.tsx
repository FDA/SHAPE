import React, { Component, ReactNode } from 'react';
import { Redirect, RouteComponentProps } from 'react-router-dom';
import {
    IonButton,
    IonContent,
    IonFooter,
    IonPage,
    IonTitle,
    IonToast,
    IonToolbar,
    IonHeader,
    IonGrid,
    IonCol,
    IonRow,
    IonIcon,
    IonAlert,
    IonItem
} from '@ionic/react';
import QuestionEngine from '../../question/engine/QuestionEngine';
import { FirebaseAuth, ParticipantResponse, Person, User } from '../../interfaces/DataTypes';
import { Questionnaire, Profile } from '../../question/interfaces';
import { Context } from '../../question/engine/Context';
import { isEmptyObject, profilesWithCompletedResponse } from '../../utils/Utils';
import { routes } from '../../utils/Constants';
import { chevronBack, chevronForward } from 'ionicons/icons';

interface PassedProps extends RouteComponentProps {
    fireBaseAuth: FirebaseAuth;
    answerQuestion: Function;
    questionnaire: any;
    popQuestion: Function;
    completeQuestionnaire: Function;
    resetQuestionnaire: Function;
    pushQuestion: Function;
    surveyId: string;
    selectedProfile: Profile;
    profile: User;
    participantResponses: ParticipantResponse[];
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
    showSubmitAlert: boolean;
}

const NEXT = 'next';

class QuestionnaireInstance extends Component<PassedProps, QuestionnaireInstanceState> {
    constructor(props: PassedProps) {
        super(props);
        this.state = {
            question: null,
            profileName: '',
            surveyId: '',
            questionnaireId: '',
            engine: null,
            validationError: '',
            showSubmitAlert: false
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

    componentDidUpdate(prevProps: any) {
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
        this.props.answerQuestion({ [name]: '' });
    };

    getValue = (direction: string) => {
        let retVal = null;
        if (this.state) {
            const { engine } = this.state;
            const question = direction === NEXT ? engine.peekNextQuestion() : engine.peekPreviousQuestion();
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
        const completeStatus = hasNext ? false : true;
        const { context } = this.state.engine;
        this.props.completeQuestionnaire(context, completeStatus);
        this.setupEngine();
        document.getElementById('tabBar')!.style.display = 'flex';
        this.props.history.replace(routes.TAB1);
    };

    exit = () => {
        this.setupEngine();
        this.props.resetQuestionnaire();
        document.getElementById('tabBar')!.style.display = 'flex';
        this.props.history.replace(routes.TAB1);
    };

    completeQuestions = (hasNext: boolean) => {
        if (this.isValid()) {
            this.goHome(hasNext);
        }
    };

    showSubmitAlert = (bool: boolean) => {
        this.setState({ showSubmitAlert: bool });
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

    next = (skipValidation: boolean) => {
        if (!skipValidation && !this.isValid()) {
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
        let currentAnswer = null;
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
            fireBaseAuth,
            questionnaires
        } = this.props;

        const idx = questionnaires
            .map((q: Questionnaire) => {
                return q.id;
            })
            .indexOf(questionnaireId);
        const model = questionnaires[idx];
        const org = model.org;
        const participantId = questionnaires[idx].public
            ? fireBaseAuth.uid
            : profile.participantId.filter((elem: { org: string; id: string }) => {
                  return elem.org === org;
              })[0].id;

        const engine = new QuestionEngine(model, this.handleChange, this.clearValue, this.currentAnswerValue);
        const questionData = engine.peekCurrentQuestion();
        let currentQuestion,
            currentAnswer = null;
        if (questionnaire && questionData) {
            currentAnswer = questionnaire[questionData.name];
            currentQuestion = engine.getCurrentQuestion(currentAnswer);
        }
        engine.context = new Context(surveyId, participantId, questionnaireId, selectedProfile, id, org);
        engine.goToFirst();
        this.setState({ question: currentQuestion, engine: engine });
    };

    removeValidationError = () => {
        this.setState({ validationError: '' });
    };

    render() {
        const { engine, question, validationError, showSubmitAlert } = this.state;
        const { selectedProfile, questionnaireId, profile, participantResponses } = this.props;
        const { isEmpty } = this.props.fireBaseAuth;
        if (!engine) {
            return null;
        }
        if (isEmpty) {
            return <Redirect to={routes.LOGIN} />;
        }
        const { hasNext, hasPrevious } = engine;
        const message = `Question ${engine.getCurrentIndex()} of ${engine.getQuestionsLen()}`;
        const isInvalid = !isEmptyObject(validationError);

        const disableEdit = profilesWithCompletedResponse(questionnaireId, participantResponses, profile)
            .map((prof: Person) => prof.id)
            .includes(selectedProfile.id);

        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar class='ion-no-border'>
                        <IonTitle>Questionnaire</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent class='ion-padding'>
                    <p id='q13-profile'>Answering on behalf of {selectedProfile.name}</p>
                    {disableEdit ? (
                        <IonItem style={{ pointerEvents: 'none' }} tabIndex={-1}>
                            {question}
                        </IonItem>
                    ) : (
                        question
                    )}
                </IonContent>
                <IonFooter class='ion-no-border'>
                    <IonToolbar>
                        <IonGrid>
                            <p id='q13-progress-message'>{message}</p>
                            <IonRow>
                                {disableEdit ? (
                                    <IonCol>
                                        <IonButton
                                            expand='block'
                                            fill='solid'
                                            color='light'
                                            onClick={() => this.exit()}>
                                            Exit
                                        </IonButton>
                                    </IonCol>
                                ) : (
                                    <>
                                        <IonCol>
                                            <IonButton
                                                expand='block'
                                                fill='solid'
                                                color='light'
                                                onClick={() => this.goHome(true)}>
                                                Save and Exit
                                            </IonButton>
                                        </IonCol>
                                        {!hasNext && (
                                            <IonCol>
                                                <IonButton
                                                    expand='block'
                                                    fill='solid'
                                                    color='secondary'
                                                    onClick={() => this.showSubmitAlert(true)}>
                                                    Submit
                                                </IonButton>
                                            </IonCol>
                                        )}
                                    </>
                                )}
                            </IonRow>
                            <IonRow>
                                {hasPrevious && (
                                    <IonCol>
                                        <IonButton
                                            expand='block'
                                            fill='solid'
                                            color='primary'
                                            onClick={this.previous}>
                                            <IonIcon
                                                slot='start'
                                                icon={chevronBack}
                                                aria-label={'back icon'}
                                            />
                                            Back
                                        </IonButton>
                                    </IonCol>
                                )}
                                {hasNext && (
                                    <IonCol>
                                        <IonButton
                                            expand='block'
                                            fill='solid'
                                            color='primary'
                                            onClick={() => this.next(disableEdit)}>
                                            <IonIcon
                                                slot='end'
                                                icon={chevronForward}
                                                aria-label={'next icon'}
                                            />
                                            Next
                                        </IonButton>
                                    </IonCol>
                                )}
                            </IonRow>
                        </IonGrid>
                    </IonToolbar>
                </IonFooter>
                <IonAlert
                    aria-label={'submit confirmation window'}
                    isOpen={showSubmitAlert}
                    header='Submit Answers'
                    message='Are you sure? Answers cannot be changed after clicking submit.'
                    buttons={[
                        {
                            text: 'Cancel',
                            handler: () => {
                                this.showSubmitAlert(false);
                            }
                        },
                        {
                            text: 'Submit',
                            handler: () => {
                                this.showSubmitAlert(false);
                                this.completeQuestions(false);
                            }
                        }
                    ]}
                />
                <IonToast
                    isOpen={isInvalid}
                    color={'danger'}
                    duration={2000}
                    message={validationError}
                    onWillDismiss={this.removeValidationError}
                    buttons={[
                        {
                            text: 'x',
                            role: 'cancel'
                        }
                    ]}
                />
            </IonPage>
        );
    }
}

export default QuestionnaireInstance;
