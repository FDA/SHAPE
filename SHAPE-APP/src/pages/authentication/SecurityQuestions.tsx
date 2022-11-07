import React, { Component, SyntheticEvent } from 'react';
import { IonButton, IonContent, IonInput, IonItem, IonLabel, IonPage, IonToast } from '@ionic/react';
import Loading from '../layout/Loading';
import AppHeader from '../layout/AppHeader';
import { difference, isEmptyObject } from '../../utils/Utils';
import { Participant, SecurityQuestion } from '../../interfaces/DataTypes';
import { routes } from '../../utils/Constants';

interface PassedProps {
    participant: Participant;
    isLoading: boolean;
    resetparticipantLookup: Function;
    isEmpty: boolean;
    org: string;
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
            userVerified: null
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
        Object.entries(this.state.answers).forEach(([key, value]: [string, any]) => {
            const question: SecurityQuestion = { answer: value, question: key };
            answeredQuestions.push(question);
        });

        let diff = false;
        for (const index in participant.securityQuestions) {
            if (
                participant.securityQuestions[index].answer.toLowerCase() !==
                answeredQuestions[index].answer.toLowerCase()
            ) {
                diff = true;
            }
        }

        if (!diff) {
            this.setState({
                userVerified: true
            });
        } else {
            this.setState({
                userVerified: false
            });
        }
    };

    resetState = () => {
        this.setState({ userVerified: null });
    };

    handleChange = (event: CustomEvent<InputEvent>) => {
        const { name, value } = event.target as HTMLInputElement;
        const { answers } = this.state;
        this.setState({
            answers: {
                ...answers,
                [name]: value
            }
        });
    };

    render = () => {
        const { isLoading, participant, isEmpty, org } = this.props;
        const { userVerified } = this.state;
        const { securityQuestions } = participant;
        const routerLink = isEmpty
            ? routes.TERMS_AND_CONDITIONS
            : `${routes.TAB_TERMS_AND_CONDITIONS}/${org}/private`;

        if (!securityQuestions) {
            return null;
        }

        const LoadingIndicator = isLoading ? <Loading /> : null;
        let { answers } = this.state;

        const formControls = participant.securityQuestions.map((question: SecurityQuestion) => {
            if (answers && answers.answers) {
                answers = answers.answers;
            }

            const val = answers[question.question];
            return (
                <IonItem key={question.question}>
                    <IonLabel position='stacked' className='ion-text-wrap ion-diagnostic-stack-header'>
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
        });

        const nextButton = userVerified ? (
            <IonButton
                expand='block'
                fill='solid'
                id='sq-next-button'
                routerLink={routerLink}
                color='primary'>
                Next
            </IonButton>
        ) : null;

        return (
            <IonPage>
                <AppHeader showHeader={true} text={'Security Questions'} />
                <IonContent className='ion-padding'>
                    {LoadingIndicator}
                    <p className='small-text'>
                        For your security, please answer the security questions you have previously stated.
                        All answers are case sensitive and must match your registered self-identified
                        questions.
                    </p>
                    <form onSubmit={(e) => this.handleSubmit(e)}>
                        {formControls}
                        {nextButton}
                        {!userVerified && (
                            <IonButton
                                fill='solid'
                                style={{ marginTop: '.5em' }}
                                expand='block'
                                type='submit'
                                id='check-answers-button'
                                color='primary'>
                                Check Answers
                            </IonButton>
                        )}
                        <IonButton
                            id='reset-button'
                            routerLink={routes.LOGIN_CARD}
                            fill='solid'
                            style={{ marginTop: '.5em' }}
                            expand='block'
                            type='button'
                            color='light'
                            onClick={() => {
                                this.props.resetparticipantLookup();
                            }}>
                            Start Over
                        </IonButton>
                    </form>
                    {!isEmptyObject(userVerified) && (
                        <p className='small-text'>You have been verified, proceed to registration.</p>
                    )}
                    <IonToast
                        id='validation-error-toast'
                        isOpen={userVerified !== undefined && userVerified !== null && !userVerified}
                        color={'dark'}
                        duration={3000}
                        message='Your answers do not match answers on file. Please contact support for help'
                        onDidDismiss={this.resetState}
                        buttons={[
                            {
                                text: 'x',
                                role: 'cancel'
                            }
                        ]}
                    />
                </IonContent>
            </IonPage>
        );
    };
}

export default SecurityQuestions;
