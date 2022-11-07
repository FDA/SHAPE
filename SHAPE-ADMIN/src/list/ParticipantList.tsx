import {
    IonItem,
    IonLabel,
    IonList,
    IonCol,
    IonButton,
    IonCard,
    IonCardContent,
    IonRow,
    IonText
} from '@ionic/react';
import React, { Component } from 'react';
import { getParticipant, getUserInfo, getQuestionnaires } from '../utils/API';
import { isEmptyObject } from '../utils/Utils';
import { connect } from 'react-redux';
import Loading from '../layout/Loading';
import { updateSurvey } from '../redux/actions/Survey';
import { updateQuestionnaire } from '../redux/actions/Questionnaire';
import { Survey } from '../interfaces/DataTypes';

interface ReduxProps {
    survey: Survey;
    updateSurveyDispatch: any;
    updateQuestionnaireDispatch: any;
}

interface State {
    participantList: Array<string>;
    isLoading: boolean;
    error: boolean;
}

class ParticipantList extends Component<ReduxProps, State> {
    private _isMounted = false;

    constructor(props: any) {
        super(props);
        this.state = {
            participantList: [],
            isLoading: false,
            error: false
        };
    }

    load() {
        const parent = this;
        let participantList: string[] = [];
        let { survey } = this.props;

        let participants = !isEmptyObject(survey.participants) ? survey.participants : [];

        let promises = participants.map((participantId: string) => {
            return new Promise<void>((resolve, reject) => {
                if (survey.public) {
                    let tempDoc: any = {};
                    getUserInfo(participantId)
                        .then((doc: any) => {
                            let data = doc.data;
                            tempDoc.active = data.active;
                            tempDoc.created = true;
                            tempDoc.userId = doc.id;
                            tempDoc.dateCreated = data.dateCreated;
                            tempDoc.firstName = data.firstName;
                            tempDoc.lastName = data.lastName;
                            tempDoc.userName = data.userName;
                            tempDoc.phoneNumber = data.phoneNumber;
                            tempDoc.optedOut = !isEmptyObject(data.optedOut) ? data.optedOut : false;
                            participantList.push(tempDoc);
                            resolve();
                        })
                        .catch((e: any) => {
                            console.error(e);
                            resolve();
                        });
                } else {
                    getParticipant(participantId)
                        .then((doc: any) => {
                            let userId = doc.data.userId;
                            let tempDoc: any = { participantId: participantId };
                            if (userId) {
                                getUserInfo(userId)
                                    .then((userDoc: any) => {
                                        let data = userDoc.data;
                                        tempDoc.active = data.active;
                                        tempDoc.created = true;
                                        tempDoc.userId = userDoc.id;
                                        tempDoc.dateCreated = data.dateCreated;
                                        tempDoc.firstName = data.firstName;
                                        tempDoc.lastName = data.lastName;
                                        tempDoc.userName = data.userName;
                                        tempDoc.phoneNumber = data.phoneNumber;
                                        tempDoc.optedOut = !isEmptyObject(data.optedOut)
                                            ? data.optedOut
                                            : false;
                                        participantList.push(tempDoc);
                                        resolve();
                                    })
                                    .catch((e: any) => {
                                        console.error(e);
                                        resolve();
                                    });
                            } else {
                                participantList.push(tempDoc);
                                resolve();
                            }
                        })
                        .catch((e: any) => {
                            console.error(e);
                            if (parent._isMounted) {
                                parent.setState({
                                    isLoading: false,
                                    error: true
                                });
                            }
                            resolve();
                        });
                }
            });
        });

        Promise.all(promises)
            .then(() => {
                if (parent._isMounted) {
                    parent.setState({
                        participantList: [...participantList].sort((p1: any, p2: any) =>
                            p1.participantId > p2.participantId ? 1 : -1
                        ),
                        isLoading: false,
                        error: false
                    });
                }
            })
            .catch((err) => {
                console.error(err);
                if (parent._isMounted) {
                    this.setState({ isLoading: false, error: true });
                }
            });
    }

    UNSAFE_componentWillReceiveProps() {
        this.setState({ isLoading: true });
        this.load();
    }

    componentDidMount() {
        this._isMounted = true;
        this.setState({ isLoading: true });
        this.load();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    delete = (participantId: string) => {
        this.setState({ isLoading: true });
        let { survey, updateSurveyDispatch, updateQuestionnaireDispatch } = this.props;
        let { participants, id } = survey;
        participants = participants.filter((elem: string) => {
            return elem !== participantId;
        });

        survey.participants = participants;

        updateSurveyDispatch(id, survey);
        this.setState({
            participantList: participants
        });

        getQuestionnaires(id)
            .then((snapshot: any) => {
                snapshot.forEach((doc: any) => {
                    let questionnaire = doc.data;
                    let questionnaireParticipants = questionnaire.participants;
                    if (!isEmptyObject(questionnaireParticipants)) {
                        questionnaireParticipants = questionnaireParticipants.filter((elem: string) => {
                            return elem !== participantId;
                        });
                        questionnaire.participants = questionnaireParticipants;
                        updateQuestionnaireDispatch(doc.id, questionnaire);
                        this.setState({ isLoading: false });
                    }
                });
            })
            .catch((err: any) => {
                console.error('Error getting documents', err);
                this.setState({ isLoading: false });
            });
    };

    render() {
        let { participantList, isLoading, error } = this.state;
        let { open, locked } = this.props.survey;
        let { survey } = this.props;

        return (
            <>
                <IonList>
                    <IonItem color='light'>
                        <IonCol size='2'>
                            <IonLabel>Respondent</IonLabel>
                        </IonCol>
                        <IonCol size='2'>
                            <IonLabel>Name</IonLabel>
                        </IonCol>
                        <IonCol size='3'>
                            <IonLabel>Email</IonLabel>
                        </IonCol>
                        <IonCol size='1.5'>
                            <IonLabel>Phone Number</IonLabel>
                        </IonCol>
                        <IonCol size='1'>
                            <IonLabel>Registered</IonLabel>
                        </IonCol>
                        <IonCol size='1.5'>
                            <IonLabel>Date Registered</IonLabel>
                        </IonCol>
                        <IonCol size='1'>
                            <IonLabel>Actions</IonLabel>
                        </IonCol>
                    </IonItem>
                    {!isLoading &&
                        participantList.map((participant: any, index: number) => {
                            let {
                                participantId,
                                created,
                                dateCreated,
                                firstName,
                                lastName,
                                userName,
                                phoneNumber,
                                optedOut,
                                userId
                            } = participant;
                            return (
                                <IonItem key={index} color={optedOut ? 'medium' : ''}>
                                    <IonCol size='2'>
                                        <IonText>
                                            {participantId ? participantId : userId}{' '}
                                            {optedOut ? ' (Opted Out)' : ''}
                                        </IonText>
                                    </IonCol>
                                    <IonCol size='2'>
                                        <IonLabel>
                                            {firstName} {lastName}
                                        </IonLabel>
                                    </IonCol>
                                    <IonCol size='3'>
                                        <IonLabel>{userName}</IonLabel>
                                    </IonCol>
                                    <IonCol size='1.5'>
                                        <IonLabel>{phoneNumber}</IonLabel>
                                    </IonCol>
                                    <IonCol size='1'>
                                        <IonLabel>{created ? 'Yes' : 'No'}</IonLabel>
                                    </IonCol>
                                    <IonCol size='1.5'>
                                        <IonLabel>
                                            {!isEmptyObject(dateCreated)
                                                ? new Date(dateCreated).toLocaleDateString()
                                                : ''}
                                        </IonLabel>
                                    </IonCol>
                                    <IonCol size='1'>
                                        <IonButton
                                            color='danger'
                                            disabled={(!isEmptyObject(locked) ? locked : false) && !open}
                                            onClick={(e: any) =>
                                                this.delete(survey.public ? userId : participantId)
                                            }>
                                            Remove
                                        </IonButton>
                                    </IonCol>
                                </IonItem>
                            );
                        })}
                </IonList>
                {isLoading && (
                    <IonRow text-center>
                        <IonCol size='12' style={{ textAlign: 'center' }}>
                            <Loading />
                        </IonCol>
                    </IonRow>
                )}
                {error && (
                    <IonCard style={{ textAlign: 'center' }}>
                        <IonCardContent>
                            <IonText color='danger'>Error loading respondents. Try refreshing.</IonText>
                        </IonCardContent>
                    </IonCard>
                )}
                {isEmptyObject(participantList) && !isLoading && !error && (
                    <IonCard style={{ textAlign: 'center' }}>
                        <IonCardContent>No respondents have been added to this survey.</IonCardContent>
                    </IonCard>
                )}
            </>
        );
    }
}

function mapStateToProps(state: any) {
    return {
        survey: state.survey
    };
}

function mapDispatchToProps(dispatch: any) {
    return {
        updateSurveyDispatch(surveyId: string, survey: any) {
            dispatch(updateSurvey(surveyId, survey));
        },
        updateQuestionnaireDispatch(questionnaireId: string, questionnaire: any) {
            dispatch(updateQuestionnaire(questionnaireId, questionnaire));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ParticipantList);
