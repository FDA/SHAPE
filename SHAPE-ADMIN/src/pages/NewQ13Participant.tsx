import {
    IonLabel,
    IonList,
    IonItem,
    IonButton,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonText,
    IonCheckbox,
    IonButtons,
    IonBackButton,
    IonPage,
    IonContent,
    IonCol
} from '@ionic/react';
import { isEmptyObject } from '../utils/Utils';
import React, { Component } from 'react';
import { getParticipant, getUserInfo } from '../utils/API';
import { connect } from 'react-redux';
import { updateQuestionnaire } from '../redux/actions/Questionnaire';
import { isLoading } from '../redux/actions/Navigation';
import LoadingScreen from '../layout/LoadingScreen';
import { cloneDeep } from 'lodash';
import { Questionnaire, Survey, Participant } from '../interfaces/DataTypes';
import { routes } from '../utils/Constants';
import { withRouter, RouteComponentProps } from 'react-router-dom';

interface ReduxProps extends RouteComponentProps {
    questionnaire: Questionnaire;
    updateQuestionnaireDispatch: Function;
    survey: Survey;
    isLoading: boolean;
    toggleLoadingDispatch: Function;
}

interface State {
    displayData: any;
    questionList: Array<string>;
    success: boolean;
    checkedList: Array<string>;
    participantList: Array<Participant>;
    allChecked: boolean;
}

class NewQ13Participant extends Component<ReduxProps, State> {
    constructor(props: ReduxProps) {
        super(props);
        this.state = {
            displayData: <div />,
            questionList: [],
            success: false,
            checkedList: [],
            participantList: [],
            allChecked: false
        };
    }

    handleChange = (e: any) => {
        let tempList = this.state.checkedList;
        if (e.target.checked) {
            tempList.push(e.target.value);
        } else {
            tempList = tempList.filter((elem: string) => {
                return elem !== e.target.value;
            });
        }
        this.setState({ checkedList: tempList });
    };

    add = () => {
        let { questionnaire } = this.props;
        let questionnaireId = questionnaire.id;
        let { checkedList } = this.state;

        let oldParticipantList = !isEmptyObject(questionnaire.participants) ? questionnaire.participants : [];

        checkedList = checkedList.concat(oldParticipantList);
        questionnaire.participants = checkedList;

        this.props.updateQuestionnaireDispatch(questionnaireId, questionnaire);

        this.props.history.goBack();
    };

    checkAll = () => {
        let { allChecked, participantList } = this.state;
        let strippedParticipantList = participantList.map((elem: Participant) => {
            return elem.participantId;
        });
        //if not checked already
        if (!allChecked) {
            this.setState({
                checkedList: strippedParticipantList,
                allChecked: true
            });
        } else {
            this.setState({ checkedList: [], allChecked: false });
        }
    };

    load() {
        this.props.toggleLoadingDispatch(true);
        let { survey, questionnaire } = this.props;
        let { participantList } = this.state;
        let parent = this;
        let surveyParticipants = !isEmptyObject(survey.participants) ? cloneDeep(survey.participants) : [];
        let questionnaireParticipants = !isEmptyObject(questionnaire.participants)
            ? cloneDeep(questionnaire.participants)
            : [];

        surveyParticipants = surveyParticipants.filter((elem: any) => {
            return questionnaireParticipants.indexOf(elem) < 0;
        });

        if (!questionnaire.public) {
            let promises = surveyParticipants.map((participantId: any) => {
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
                                        tempDoc.userId = userDoc.id;
                                        tempDoc.dateCreated = userDoc.data.dateCreated;
                                        tempDoc.name = `${userDoc.data.firstName} ${userDoc.data.lastName}`;
                                        tempDoc.email = userDoc.data.userName;
                                        participantList.push(tempDoc);
                                        resolve();
                                    })
                                    .catch((err: any) => {
                                        console.error(err);
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
                    parent.setState({
                        participantList: participantList
                    });
                    this.props.toggleLoadingDispatch(false);
                })
                .catch((err) => {
                    console.error(err);
                    this.props.toggleLoadingDispatch(false);
                });
        } else {
            let promises = surveyParticipants.map((userId: any) => {
                return new Promise<void>((resolve) => {
                    let tempDoc: any = { participantId: userId };
                    getUserInfo(userId)
                        .then((doc: any) => {
                            tempDoc.active = doc.data.active;
                            tempDoc.email = doc.data.userName;
                            tempDoc.name = `${doc.data.firstName} ${doc.data.lastName}`;
                            tempDoc.created = true;
                            tempDoc.userId = doc.id;
                            tempDoc.dateCreated = doc.data.dateCreated;
                            participantList.push(tempDoc);
                            resolve();
                        })
                        .catch((err: any) => {
                            console.error(err);
                            resolve();
                        });
                });
            });

            Promise.all(promises)
                .then((res) => {
                    parent.setState({
                        participantList: participantList
                    });
                    this.props.toggleLoadingDispatch(false);
                })
                .catch((err) => {
                    console.error(err);
                    this.props.toggleLoadingDispatch(false);
                });
        }
    }

    componentDidMount() {
        this.load();
    }

    render = () => {
        let { allChecked, checkedList, participantList } = this.state;

        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot='start'>
                            <IonBackButton defaultHref={routes.HOME} />
                        </IonButtons>
                        <IonTitle style={{ verticalAlign: 'middle' }}>
                            Add Respondents From Survey
                            <div style={{ float: 'right', maxHeight: '20px' }}>
                                {this.state.success && (
                                    <IonText color='success' style={{ fontSize: '14px' }}>
                                        Successfully saved &nbsp;&nbsp;&nbsp;
                                    </IonText>
                                )}
                            </div>
                        </IonTitle>
                        <IonButtons slot='end'>
                            <IonButton
                                style={{ margin: '16px' }}
                                fill='solid'
                                color='primary'
                                onClick={() => this.add()}>
                                Add Respondent(s)
                            </IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <IonList>
                        <IonItem color='light' key='header'>
                            <IonCol size='.5'>
                                <IonCheckbox checked={allChecked} onClick={(e: any) => this.checkAll()} />
                            </IonCol>
                            <IonCol size='2.5'>
                                <IonLabel>Respondent</IonLabel>
                            </IonCol>
                            <IonCol size='2'>
                                <IonLabel>Name</IonLabel>
                            </IonCol>
                            <IonCol size='3'>
                                <IonLabel>Email</IonLabel>
                            </IonCol>
                            <IonCol size='1.5'>
                                <IonLabel>Account Created</IonLabel>
                            </IonCol>
                            <IonCol size='1.5'>
                                <IonLabel>Date Registered</IonLabel>
                            </IonCol>
                            <IonCol size='1'>
                                <IonLabel>Enabled</IonLabel>
                            </IonCol>
                        </IonItem>
                        {participantList.map((participant: any) => {
                            let { participantId, active, created, dateCreated, email, name } = participant;
                            return (
                                <IonItem key={participantId}>
                                    <IonCol size='.5'>
                                        <IonCheckbox
                                            value={participantId}
                                            checked={checkedList.indexOf(participantId) > -1}
                                            onClick={(e: any) => this.handleChange(e)}
                                        />
                                    </IonCol>
                                    <IonCol size='2.5'>
                                        <IonLabel>{participantId}</IonLabel>
                                    </IonCol>
                                    <IonCol size='2'>
                                        <IonLabel>{name}</IonLabel>
                                    </IonCol>
                                    <IonCol size='3'>
                                        <IonLabel>{email}</IonLabel>
                                    </IonCol>
                                    <IonCol size='1.5'>
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
                                        <IonItem>
                                            <IonCheckbox
                                                id={`${participantId}-cb`}
                                                title='enabled'
                                                color='primary'
                                                checked={active}
                                                disabled={true}
                                            />
                                        </IonItem>
                                    </IonCol>
                                </IonItem>
                            );
                        })}
                    </IonList>
                    {this.props.isLoading && <LoadingScreen />}
                </IonContent>
            </IonPage>
        );
    };
}

function mapStateToProps(state: any) {
    return {
        questionnaire: state.questionnaire,
        survey: state.survey,
        isLoading: state.loading
    };
}

function mapDispatchToProps(dispatch: any) {
    return {
        updateQuestionnaireDispatch(questionnaireId: string, questionnaire: any) {
            dispatch(updateQuestionnaire(questionnaireId, questionnaire));
        },
        toggleLoadingDispatch(loading: boolean) {
            dispatch(isLoading(loading));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(NewQ13Participant));
