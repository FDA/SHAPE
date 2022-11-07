import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    IonItem,
    IonLabel,
    IonList,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonListHeader,
    IonRow
} from '@ionic/react';
import { getParticipant, getUserInfo } from '../utils/API';
import { isEmptyObject } from '../utils/Utils';
import { ParticipantProgress, SurveyProgress } from '.';
import Loading from '../layout/Loading';
import { Survey, Questionnaire, User } from '../interfaces/DataTypes';
import { routes } from '../utils/Constants';
import { storeQuestionnaire } from '../redux/actions/Questionnaire';
import { withRouter, RouteComponentProps } from 'react-router-dom';

interface QObjectDataElement {
    id: string;
    name: string;
}

interface QObject {
    participantId: string;
    data: Array<QObjectDataElement>;
}

interface Props extends RouteComponentProps {
    survey: Survey;
    questionnaireId?: string;
    questionnaire: Questionnaire;
    view: string;
    storeQuestionnaireDispatch: Function;
}

interface State {
    participantHTML: any;
    editing: Array<string>;
    participantList: Array<User>;
    notStartedQs: Array<QObject>;
    inProgressQs: Array<QObject>;
    completedQs: Array<QObject>;
    // for survey status
    allCompleted: Array<string>;
    noneStarted: Array<string>;
    inProgress: Array<string>;
    isLoading: boolean;
}

type QObjectKey = 'inProgressQs' | 'notStartedQs' | 'completedQs';

class ParticipantProgressPanel extends Component<Props, State> {
    private _isMounted = false;
    constructor(props: Props) {
        super(props);
        this.state = {
            participantHTML: <div />,
            editing: [],
            participantList: [],
            notStartedQs: [],
            inProgressQs: [],
            completedQs: [],
            // for survey status
            allCompleted: [],
            noneStarted: [],
            inProgress: [],
            isLoading: false
        };
    }

    componentDidMount() {
        this._isMounted = true;
        this.setState({ isLoading: true });
        this.loadParticipants();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    setQuestionnaireStatus = (flag: QObjectKey, data: QObject) => {
        if (this._isMounted) {
            //@ts-ignore
            this.setState({
                [flag]: [data, ...this.state[flag]]
            });
        }
    };

    setAllCompleted = (participantId: any) => {
        this.setState({
            allCompleted: [participantId, ...this.state.allCompleted]
        });
    };
    setNoneStarted = (participantId: any) => {
        this.setState({
            noneStarted: [participantId, ...this.state.noneStarted]
        });
    };
    setInProgress = (participantId: any) => {
        this.setState({
            inProgress: [participantId, ...this.state.inProgress]
        });
    };

    loadParticipants = () => {
        const parent = this;
        let participantList: User[] = [];
        let { survey } = this.props;

        let participants = !isEmptyObject(survey.participants) ? survey.participants : [];
        if (survey.public) {
            let promises = participants.map((participantId: string) => {
                return new Promise<void>((resolve) => {
                    let tempDoc: any = { participantId: participantId };
                    getUserInfo(participantId)
                        .then((doc: any) => {
                            tempDoc.active = doc.data.active;
                            tempDoc.created = true;
                            participantList.push(tempDoc);
                            resolve();
                        })
                        .catch(() => {
                            resolve();
                        });
                });
            });

            Promise.all(promises)
                .then((res) => {
                    if (parent._isMounted) {
                        parent.setState({
                            participantList: [...participantList].sort((p1: any, p2: any) =>
                                p1.participantId > p2.participantId ? 1 : -1
                            ),
                            isLoading: false
                        });
                    }
                })
                .catch((err: any) => {
                    console.error(err);
                });
        } else {
            let promises = participants.map((participantId: string) => {
                return new Promise<void>((resolve) => {
                    getParticipant(participantId)
                        .then(function (doc: any) {
                            let userId = doc.data.userId;
                            let tempDoc: any = { participantId: participantId };
                            if (userId) {
                                getUserInfo(userId)
                                    .then((userDoc: any) => {
                                        tempDoc.active = userDoc.data.active;
                                        tempDoc.created = true;
                                        participantList.push(tempDoc);
                                        resolve();
                                    })
                                    .catch(() => {
                                        resolve();
                                    });
                            } else {
                                participantList.push(tempDoc);
                                resolve();
                            }
                        })
                        .catch((err: any) => {
                            console.error(err);
                        });
                });
            });

            Promise.all(promises)
                .then((res) => {
                    if (parent._isMounted) {
                        parent.setState({
                            participantList: [...participantList].sort((p1: any, p2: any) =>
                                p1.participantId > p2.participantId ? 1 : -1
                            ),
                            isLoading: false
                        });
                    }
                })
                .catch((err: any) => {
                    console.error(err);
                });
        }
    };

    getCompletedQs = (participantId: string) => {
        let result: Array<QObjectDataElement> = [];
        let match = this.state.completedQs.find((e: QObject) => e.participantId === participantId);

        let { survey, storeQuestionnaireDispatch } = this.props;
        let surveyId = survey.id;

        if (match) {
            result = match.data;
        }
        return (
            <IonList>
                {result.map((e: QObjectDataElement) => {
                    return (
                        <IonItem
                            button
                            key={`${participantId}-${e.id}`}
                            onClick={() => {
                                storeQuestionnaireDispatch(e.id);
                                this.props.history.push(`${routes.SURVEY}/${surveyId}/questionnaire/${e.id}`);
                            }}>
                            {`${e.name}`}
                        </IonItem>
                    );
                })}
            </IonList>
        );
    };

    getInProgressQs = (participantId: string) => {
        let result: Array<QObjectDataElement> = [];

        let match = this.state.inProgressQs.find((e: QObject) => e.participantId === participantId);
        if (match) {
            result = match.data;
        }
        let { survey, storeQuestionnaireDispatch } = this.props;
        let surveyId = survey.id;

        return (
            <IonList>
                {result.map((e: QObjectDataElement) => {
                    return (
                        <IonItem
                            button
                            key={`${participantId}-${e.id}`}
                            onClick={() => {
                                storeQuestionnaireDispatch(e.id);
                                this.props.history.push(`${routes.SURVEY}/${surveyId}/questionnaire/${e.id}`);
                            }}>
                            {`${e.name}`}
                        </IonItem>
                    );
                })}
            </IonList>
        );
    };

    getNotStartedQs = (participantId: string) => {
        let result: Array<QObjectDataElement> = [];

        let match = this.state.notStartedQs.find((e: QObject) => e.participantId === participantId);
        if (match) {
            result = match.data;
        }
        let { survey, storeQuestionnaireDispatch } = this.props;
        let surveyId = survey.id;
        return (
            <IonList>
                {result.map((e: QObjectDataElement) => {
                    return (
                        <IonItem
                            button
                            key={`${participantId}-${e.id}`}
                            onClick={() => {
                                storeQuestionnaireDispatch(e.id);
                                this.props.history.push(`${routes.SURVEY}/${surveyId}/questionnaire/${e.id}`);
                            }}>
                            {`${e.name}`}
                        </IonItem>
                    );
                })}
            </IonList>
        );
    };

    getIndividualStatus = (participantId: string) => {
        let result = 'Not Started';
        let match = this.state.inProgressQs.find((e: QObject) => e.participantId === participantId);
        let { questionnaireId } = this.props;
        if (match) {
            let temp = match.data.find((e: QObjectDataElement) => e.id === questionnaireId);
            if (temp) return 'In Progress';
        }
        match = this.state.completedQs.find((e: QObject) => e.participantId === participantId);
        if (match) {
            let temp = match.data.find((e: QObjectDataElement) => e.id === questionnaireId);
            if (temp) return 'Completed';
        }
        return result;
    };

    getQuestionnaireView = () => {
        let { participantList, isLoading } = this.state;

        return (
            <div key='questionnaire-view'>
                <IonList>
                    <IonItem color='light' key='header'>
                        <IonCol size='4'>
                            <IonLabel>Respondent</IonLabel>
                        </IonCol>
                        <IonCol size='2'>
                            <IonLabel>Status</IonLabel>
                        </IonCol>
                    </IonItem>
                    {isLoading && (
                        <IonRow text-center>
                            <IonCol size='12' style={{ textAlign: 'center' }}>
                                <Loading />
                            </IonCol>
                        </IonRow>
                    )}
                    {participantList
                        .filter((participant: any) => {
                            return !isEmptyObject(this.props.questionnaire.participants)
                                ? this.props.questionnaire.participants.indexOf(participant.participantId) >
                                      -1
                                : false;
                        })
                        .map((participant: any) => {
                            let { participantId } = participant;
                            let status = this.getIndividualStatus(participantId);
                            let statusColor = '';

                            switch (status) {
                                case 'Not Started':
                                    statusColor = '#007CBA';
                                    break;
                                case 'In Progress':
                                    statusColor = '#F6987A';
                                    break;
                                case 'Completed':
                                    statusColor = '#66B584';
                                    break;
                            }

                            return (
                                <IonItem key={participantId}>
                                    <IonCol size='4'>
                                        <IonLabel>{participantId}</IonLabel>
                                    </IonCol>
                                    <IonCol size='2'>
                                        {status}
                                        <div
                                            style={{
                                                backgroundColor: `${statusColor}`,
                                                border: '1px solid black',
                                                display: 'inline',
                                                paddingLeft: '1em',
                                                paddingRight: '1em',
                                                float: 'right'
                                            }}>
                                            &nbsp;
                                        </div>
                                    </IonCol>
                                    <IonCol size='0'>
                                        <ParticipantProgress
                                            participantId={participantId}
                                            setQuestionnaireStatus={this.setQuestionnaireStatus}
                                            setAllCompleted={this.setAllCompleted}
                                            setNoneStarted={this.setNoneStarted}
                                            setInProgress={this.setInProgress}
                                        />
                                    </IonCol>
                                </IonItem>
                            );
                        })}
                </IonList>
            </div>
        );
    };

    render() {
        let { participantList } = this.state;
        let { view } = this.props;

        if (view === 'questionnaire') {
            return this.getQuestionnaireView();
        } else {
            return (
                <>
                    <IonCard>
                        <IonCardHeader>
                            <IonCardTitle>Survey Status</IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <SurveyProgress
                                allCompleted={this.state.allCompleted}
                                noneStarted={this.state.noneStarted}
                                inProgress={this.state.inProgress}
                            />
                        </IonCardContent>
                    </IonCard>
                    <IonCard>
                        <IonCardHeader>
                            <IonCardTitle>Respondent Statuses</IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <IonList>
                                <IonListHeader color='light'>
                                    <IonCol size='1'>
                                        <IonLabel>Respondent</IonLabel>
                                    </IonCol>
                                    <IonCol size='5'>
                                        <IonLabel>Progress</IonLabel>
                                    </IonCol>
                                    <IonCol size='2'>
                                        <IonLabel>Completed</IonLabel>
                                    </IonCol>
                                    <IonCol size='2'>
                                        <IonLabel>In Progress</IonLabel>
                                    </IonCol>
                                    <IonCol size='2'>
                                        <IonLabel>Not Started</IonLabel>
                                    </IonCol>
                                </IonListHeader>
                                {participantList.map((participant: any) => {
                                    let { participantId } = participant;
                                    return (
                                        <IonItem key={participantId}>
                                            <IonCol size='1'>
                                                <IonLabel>{participantId}</IonLabel>
                                            </IonCol>
                                            <IonCol size='5'>
                                                <ParticipantProgress
                                                    participantId={participantId}
                                                    setQuestionnaireStatus={this.setQuestionnaireStatus}
                                                    setAllCompleted={this.setAllCompleted}
                                                    setNoneStarted={this.setNoneStarted}
                                                    setInProgress={this.setInProgress}
                                                />
                                            </IonCol>
                                            <IonCol size='2'>
                                                <IonLabel>{this.getCompletedQs(participantId)}</IonLabel>
                                            </IonCol>
                                            <IonCol size='2'>{this.getInProgressQs(participantId)}</IonCol>
                                            <IonCol size='2'>{this.getNotStartedQs(participantId)}</IonCol>
                                        </IonItem>
                                    );
                                })}
                            </IonList>
                        </IonCardContent>
                    </IonCard>
                </>
            );
        }
    }
}

function mapStateToProps(state: any) {
    return {
        survey: state.survey,
        questionnaire: state.questionnaire
    };
}

function mapDispatchToProps(dispatch: any) {
    return {
        storeQuestionnaireDispatch(questionnaireId: string) {
            dispatch(storeQuestionnaire(questionnaireId));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ParticipantProgressPanel));
