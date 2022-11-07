import {
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonInput,
    IonLabel,
    IonText,
    IonList,
    IonItem,
    IonButton
} from '@ionic/react';
import { connect } from 'react-redux';
import React from 'react';
import { isEmptyObject } from '../utils/Utils';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Participant, FirebaseAuth, Survey } from '../interfaces/DataTypes';
import { createParticipant, getAllParticipants } from '../utils/API';
import { updateSurvey } from '../redux/actions/Survey';
import { routes } from '../utils/Constants';

interface ReduxProps extends RouteComponentProps {
    fireBaseAuth: FirebaseAuth;
    survey: Survey;
    updateSurveyDispatch: Function;
    loggedIn: boolean;
}

interface State {
    failure: boolean;
    duplicateFailure: boolean;
    participantId: string;
    public: boolean;
    secQ1: string;
    secA1: string;
    secQ2: string;
    secA2: string;
    secQ3: string;
    secA3: string;
}

class NewParticipant extends React.Component<ReduxProps, State> {
    constructor(props: ReduxProps) {
        super(props);
        this.state = {
            failure: false,
            duplicateFailure: false,
            participantId: '',
            public: true,
            secQ1: '',
            secA1: '',
            secQ2: '',
            secA2: '',
            secQ3: '',
            secA3: ''
        };
    }

    componentDidMount() {
        let { loggedIn } = this.props;
        if (!loggedIn) {
            this.props.history.push(routes.LOGIN);
        }
    }
    handleChange(event: any) {
        const { name, value } = event.target;
        //@ts-ignore
        this.setState({
            [name]: value
        });
    }

    submit = () => {
        const parent = this;
        let { survey } = this.props;
        const surveyId = survey.id;
        let { participantId, secQ1, secQ2, secQ3, secA1, secA2, secA3 } = this.state;

        const participants = !isEmptyObject(survey.participants) ? survey.participants : [];

        if (
            !isEmptyObject(participantId) &&
            !isEmptyObject(secQ1) &&
            !isEmptyObject(secA1) &&
            !isEmptyObject(secQ2) &&
            !isEmptyObject(secA2) &&
            !isEmptyObject(secQ3) &&
            !isEmptyObject(secA3)
        ) {
            const existingParticipants: Array<string> = [];
            getAllParticipants()
                .then((snapshot: any) => {
                    snapshot.forEach(function (doc: any) {
                        existingParticipants.push(doc.data.participantId);
                    });

                    if (existingParticipants.indexOf(participantId) === -1) {
                        let participant: Participant = {
                            participantId: participantId,
                            securityQuestions: [
                                {
                                    question: secQ1,
                                    answer: secA1
                                },
                                {
                                    question: secQ2,
                                    answer: secA2
                                },
                                {
                                    question: secQ3,
                                    answer: secA3
                                }
                            ],
                            public: true
                        };

                        createParticipant(participant)
                            .then(function () {
                                participants.push(participantId);
                                survey.participants = participants;
                                parent.props.updateSurveyDispatch(surveyId, survey);
                                parent.setState({
                                    failure: false,
                                    duplicateFailure: false,
                                    participantId: '',
                                    secQ1: '',
                                    secA1: '',
                                    secQ2: '',
                                    secA2: '',
                                    secQ3: '',
                                    secA3: ''
                                });

                                parent.props.history.push({
                                    pathname: `${routes.SURVEY}/${surveyId}`,
                                    state: { match: surveyId }
                                });
                            })
                            .catch(function (error: any) {
                                console.error('Error adding document: ', error);
                            });
                    } else {
                        this.setState({ duplicateFailure: true });
                    }
                })
                .catch((err: any) => {
                    console.error(err);
                });
        } else {
            this.setState({ failure: true });
        }
    };

    render() {
        let { participantId, secQ1, secQ2, secQ3, secA1, secA2, secA3 } = this.state;
        const { isEmpty } = this.props.fireBaseAuth;

        if (!isEmpty) {
            return (
                <>
                    <IonHeader>
                        <IonToolbar>
                            <IonTitle>Create New Respondent</IonTitle>
                        </IonToolbar>
                    </IonHeader>
                    <IonContent>
                        <form>
                            <IonList lines='full' class='ion-no-margin ion-no-padding'>
                                <IonItem>
                                    <IonLabel position='stacked'>
                                        Respondent Unique ID
                                        <IonText color='danger'>*</IonText>
                                    </IonLabel>
                                    <IonInput
                                        placeholder=''
                                        id='participant-id'
                                        value={participantId}
                                        name='participantId'
                                        onIonInput={(e) => this.handleChange(e)}></IonInput>
                                </IonItem>
                                <IonItem>
                                    <IonLabel position='stacked'>
                                        Security Question 1<IonText color='danger'>*</IonText>
                                    </IonLabel>
                                    <IonInput
                                        placeholder=''
                                        id='participant-sec-q-1'
                                        value={secQ1}
                                        name='secQ1'
                                        onIonInput={(e) => this.handleChange(e)}></IonInput>
                                </IonItem>
                                <IonItem>
                                    <IonLabel position='stacked'>
                                        Security Question 1's Answer
                                        <IonText color='danger'>*</IonText>
                                    </IonLabel>
                                    <IonInput
                                        placeholder=''
                                        id='participant-sec-a-1'
                                        value={secA1}
                                        name='secA1'
                                        onIonInput={(e) => this.handleChange(e)}></IonInput>
                                </IonItem>
                                <IonItem>
                                    <IonLabel position='stacked'>
                                        Security Question 2<IonText color='danger'>*</IonText>
                                    </IonLabel>
                                    <IonInput
                                        placeholder=''
                                        id='participant-sec-q-2'
                                        value={secQ2}
                                        name='secQ2'
                                        onIonInput={(e) => this.handleChange(e)}></IonInput>
                                </IonItem>
                                <IonItem>
                                    <IonLabel position='stacked'>
                                        Security Question 2's Answer
                                        <IonText color='danger'>*</IonText>
                                    </IonLabel>
                                    <IonInput
                                        placeholder=''
                                        id='participant-sec-a-2'
                                        value={secA2}
                                        name='secA2'
                                        onIonInput={(e) => this.handleChange(e)}></IonInput>
                                </IonItem>
                                <IonItem>
                                    <IonLabel position='stacked'>
                                        Security Question 3<IonText color='danger'>*</IonText>
                                    </IonLabel>
                                    <IonInput
                                        placeholder=''
                                        id='participant-sec-q-3'
                                        value={secQ3}
                                        name='secQ3'
                                        onIonInput={(e) => this.handleChange(e)}></IonInput>
                                </IonItem>
                                <IonItem>
                                    <IonLabel position='stacked'>
                                        Security Question 3's Answer
                                        <IonText color='danger'>*</IonText>
                                    </IonLabel>
                                    <IonInput
                                        placeholder=''
                                        id='participant-sec-a-3'
                                        value={secA3}
                                        name='secA3'
                                        onIonInput={(e) => this.handleChange(e)}></IonInput>
                                </IonItem>
                            </IonList>
                            <IonButton size='small' fill='outline' onClick={this.submit}>
                                Submit
                            </IonButton>
                            {this.state.failure && (
                                <IonText color='danger'>All required fields are not filled.</IonText>
                            )}
                            {this.state.duplicateFailure && (
                                <IonText color='danger'>Participant ID already exists.</IonText>
                            )}
                        </form>
                    </IonContent>
                </>
            );
        }
    }
}

const mapStateToProps = (state: any) => ({
    fireBaseAuth: state.firebase.auth,
    survey: state.survey,
    loggedIn: state.authentication.loggedIn
});

function mapDispatchToProps(dispatch: any) {
    return {
        updateSurveyDispatch(surveyId: string, survey: Survey) {
            dispatch(updateSurvey(surveyId, survey));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(NewParticipant));
