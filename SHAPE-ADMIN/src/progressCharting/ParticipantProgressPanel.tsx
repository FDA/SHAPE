import React, {Component} from 'react';
import {connect} from 'react-redux';
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
import {getParticipant, getUser} from '../utils/API';
import {isEmptyObject} from '../utils/Utils';
import {ParticipantProgress, SurveyProgress} from '.';
import Loading from '../layout/Loading';
import {Survey, Questionnaire, User} from '../interfaces/DataTypes';
import {routes} from '../utils/Constants';

interface QObjectDataElement {
    id: string;
    name: string;
}

interface QObject {
    participantId: string;
    data: Array<QObjectDataElement>;
}

interface Props {
    survey: Survey;
    questionnaireId?: string;
    questionnaire: Questionnaire;
    view: string;
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
        this.setState({isLoading: true});
        this.loadParticipants();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    setQuestionnaireStatus = (flag: QObjectKey, data: QObject) => {
        if(this._isMounted){
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
        let {survey} = this.props;

        let participants = !isEmptyObject(survey.participants)
            ? survey.participants
            : [];
        let promises = participants.map((participantId: string) => {
            return new Promise((resolve) => {
                getParticipant(participantId)
                    .then(function (doc: any) {
                        let tempDoc = doc.data;
                        tempDoc.id = doc.id;
                        getUser(participantId)
                            .then((snapshot: any) => {
                                if (snapshot.length > 0) {
                                    snapshot.forEach(function (snap: any) {
                                        tempDoc.active = snap.data.active;
                                        tempDoc.created = true;
                                        participantList.push(tempDoc);
                                        resolve();
                                    });
                                } else {
                                    tempDoc.created = false;
                                    participantList.push(tempDoc);
                                    resolve();
                                }
                            })
                            .catch(() => {
                                resolve();
                            });
                    })
                    .catch((err: any) => {
                        console.error(err);
                    });
            });
        });

        Promise.all(promises)
            .then((res) => {
                if(parent._isMounted){
                    parent.setState({
                        participantList: participantList,
                        isLoading: false
                    });
                }
            })
            .catch((err: any) => {
                console.error(err);
            });
    };

    getCompletedQs = (participantId: string) => {
        let result: Array<QObjectDataElement> = [];
        let match = this.state.completedQs.find(
            (e: QObject) => e.participantId === participantId
        );

        let {survey} = this.props;
        let surveyId = survey.id;

        if (match) {
            result = match.data;
        }
        return (
            <IonList>
                {result.map((e: QObjectDataElement) => {
                    return (
                        <IonItem
                            key={`${participantId}-${e.id}`}
                            routerLink={`${routes.SURVEY}/${surveyId}/questionnaire/${e.id}`}>
                            {`${e.name}`}
                        </IonItem>
                    );
                })}
            </IonList>
        );
    };

    getInProgressQs = (participantId: string) => {
        let result: Array<QObjectDataElement> = [];

        let match = this.state.inProgressQs.find(
            (e: QObject) => e.participantId === participantId
        );
        if (match) {
            result = match.data;
        }
        let {survey} = this.props;
        let surveyId = survey.id;

        return (
            <IonList>
                {result.map((e: QObjectDataElement) => {
                    return (
                        <IonItem
                            key={`${participantId}-${e.id}`}
                            routerLink={`${routes.SURVEY}/${surveyId}/questionnaire/${e.id}`}>
                            {`${e.name}`}
                        </IonItem>
                    );
                })}
            </IonList>
        );
    };

    getNotStartedQs = (participantId: string) => {
        let result: Array<QObjectDataElement> = [];

        let match = this.state.notStartedQs.find(
            (e: QObject) => e.participantId === participantId
        );
        if (match) {
            result = match.data;
        }
        let {survey} = this.props;
        let surveyId = survey.id;
        return (
            <IonList>
                {result.map((e: QObjectDataElement) => {
                    return (
                        <IonItem
                            key={`${participantId}-${e.id}`}
                            routerLink={`${routes.SURVEY}/${surveyId}/questionnaire/${e.id}`}>
                            {`${e.name}`}
                        </IonItem>
                    );
                })}
            </IonList>
        );
    };

    getIndividualStatus = (participantId: string) => {
        let result = 'Not Started';
        let match = this.state.inProgressQs.find(
            (e: QObject) => e.participantId === participantId
        );
        let {questionnaireId} = this.props;
        if (match) {
            let temp = match.data.find(
                (e: QObjectDataElement) => e.id === questionnaireId
            );
            if (temp) return 'In Progress';
        }
        match = this.state.completedQs.find(
            (e: QObject) => e.participantId === participantId
        );
        if (match) {
            let temp = match.data.find(
                (e: QObjectDataElement) => e.id === questionnaireId
            );
            if (temp) return 'Completed';
        }
        return result;
    };

    getQuestionnaireView = () => {
        let {participantList, isLoading} = this.state;

        return (
            <>
                <IonList>
                    <IonItem color="light">
                        <IonCol size="4">
                            <IonLabel>Respondent</IonLabel>
                        </IonCol>
                        <IonCol size="2">
                            <IonLabel>Status</IonLabel>
                        </IonCol>
                    </IonItem>
                    {isLoading && (
                        <IonRow text-center>
                            <IonCol size="12" style={{textAlign: 'center'}}>
                                <Loading />
                            </IonCol>
                        </IonRow>
                    )}
                    {participantList
                        .filter((participant: any) => {
                            return !isEmptyObject(
                                this.props.questionnaire.participants
                            )
                                ? this.props.questionnaire.participants.indexOf(
                                      participant.participantId
                                  ) > -1
                                : false;
                        })
                        .map((participant: any) => {
                            let {id, participantId} = participant;
                            let status = this.getIndividualStatus(
                                participantId
                            );
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
                                <IonItem key={id}>
                                    <IonCol size="4">
                                        <IonLabel>{participantId}</IonLabel>
                                    </IonCol>
                                    <IonCol size="2">
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
                                    <IonCol size="0">
                                        <ParticipantProgress
                                            participantId={participantId}
                                            setQuestionnaireStatus={
                                                this.setQuestionnaireStatus
                                            }
                                            setAllCompleted={
                                                this.setAllCompleted
                                            }
                                            setNoneStarted={this.setNoneStarted}
                                            setInProgress={this.setInProgress}
                                        />
                                    </IonCol>
                                </IonItem>
                            );
                        })}
                </IonList>
            </>
        );
    };

    render() {
        let {participantList} = this.state;
        let {view} = this.props;

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
                                <IonListHeader color="light">
                                    <IonCol size="1">
                                        <IonLabel>Respondent</IonLabel>
                                    </IonCol>
                                    <IonCol size="5">
                                        <IonLabel>Progress</IonLabel>
                                    </IonCol>
                                    <IonCol size="2">
                                        <IonLabel>Completed</IonLabel>
                                    </IonCol>
                                    <IonCol size="2">
                                        <IonLabel>In Progress</IonLabel>
                                    </IonCol>
                                    <IonCol size="2">
                                        <IonLabel>Not Started</IonLabel>
                                    </IonCol>
                                </IonListHeader>
                                {participantList.map((participant: any) => {
                                    let {id, participantId} = participant;
                                    return (
                                        <IonItem key={id}>
                                            <IonCol size="1">
                                                <IonLabel>
                                                    {participantId}
                                                </IonLabel>
                                            </IonCol>
                                            <IonCol size="5">
                                                <ParticipantProgress
                                                    participantId={
                                                        participantId
                                                    }
                                                    setQuestionnaireStatus={
                                                        this
                                                            .setQuestionnaireStatus
                                                    }
                                                    setAllCompleted={
                                                        this.setAllCompleted
                                                    }
                                                    setNoneStarted={
                                                        this.setNoneStarted
                                                    }
                                                    setInProgress={
                                                        this.setInProgress
                                                    }
                                                />
                                            </IonCol>
                                            <IonCol size="2">
                                                <IonLabel>
                                                    {this.getCompletedQs(
                                                        participantId
                                                    )}
                                                </IonLabel>
                                            </IonCol>
                                            <IonCol size="2">
                                                {this.getInProgressQs(
                                                    participantId
                                                )}
                                            </IonCol>
                                            <IonCol size="2">
                                                {this.getNotStartedQs(
                                                    participantId
                                                )}
                                            </IonCol>
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

export default connect(mapStateToProps)(ParticipantProgressPanel);
