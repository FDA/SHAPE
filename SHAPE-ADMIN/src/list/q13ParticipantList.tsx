import {
    IonItem,
    IonLabel,
    IonList,
    IonCheckbox,
    IonCol,
    IonButton,
    IonCard,
    IonCardContent,
    IonRow,
    IonText
} from '@ionic/react';
import { Participant, Questionnaire } from '../interfaces/DataTypes';
import React, { Component } from 'react';
import { getParticipant, getUserInfo } from '../utils/API';
import { isEmptyObject } from '../utils/Utils';
import { connect } from 'react-redux';
import { format } from 'date-fns';
import { updateQuestionnaire } from '../redux/actions/Questionnaire';
import Loading from '../layout/Loading';
import { dateFormats } from '../utils/Constants';

interface ReduxProps {
    questionnaire: Questionnaire;
    updateQuestionnaireDispatch: Function;
}

interface State {
    editing: Array<string>;
    participantList: Array<ParticipantListPerson>;
    error: boolean;
    isLoading: boolean;
}

interface ParticipantListPerson extends Participant {
    created: boolean;
    userId: string;
    active: boolean;
    dateCreated: string;
    firstName: string;
    lastName: string;
    userName: string;
    phoneNumber: string;
}

class Q13ParticipantList extends Component<ReduxProps, State> {
    private _isMounted = false;
    constructor(props: any) {
        super(props);
        this.state = {
            editing: [],
            participantList: [],
            error: false,
            isLoading: false
        };
    }

    load() {
        const parent = this;
        let participantList: ParticipantListPerson[] = [];
        let { questionnaire } = this.props;

        let participants = !isEmptyObject(questionnaire.participants) ? questionnaire.participants : [];

        if (!questionnaire.public) {
            let promises = participants.map((participantId: any) => {
                return new Promise<void>((resolve, reject) => {
                    getParticipant(participantId)
                        .then(function (doc: any) {
                            let userId = doc.data.userId;
                            let tempDoc: any = {
                                participantId: participantId,
                                optedOut: doc.data.optedOut ? doc.data.optedOut : false
                            };
                            if (userId) {
                                getUserInfo(userId)
                                    .then((userDoc: any) => {
                                        let data = userDoc.data;
                                        tempDoc.userId = userDoc.id;
                                        tempDoc.active = data.active;
                                        tempDoc.created = true;
                                        tempDoc.firstName = data.firstName;
                                        tempDoc.lastName = data.lastName;
                                        tempDoc.userName = data.userName;
                                        tempDoc.phoneNumber = data.phoneNumber;
                                        tempDoc.dateCreated = data.dateCreated;
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
                            if (this._isMounted) {
                                this.setState({ isLoading: false, error: true });
                            }
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
                            isLoading: false,
                            error: false
                        });
                    }
                })
                .catch((err) => {
                    console.error(err);
                });
        } else {
            let promises = participants.map((userId: any) => {
                return new Promise<void>((resolve, reject) => {
                    //TODO: Check where optedOut is used
                    let tempDoc: any = { participantId: userId, optedOut: false };
                    getUserInfo(userId)
                        .then((doc: any) => {
                            let data = doc.data;
                            tempDoc.userId = doc.id;
                            tempDoc.active = data.active;
                            tempDoc.created = true;
                            tempDoc.firstName = data.firstName;
                            tempDoc.lastName = data.lastName;
                            tempDoc.userName = data.userName;
                            tempDoc.phoneNumber = data.phoneNumber;
                            tempDoc.dateCreated = data.dateCreated;
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
                });
        }
    }

    delete = (participantId: string) => {
        this.setState({ isLoading: true });
        let { questionnaire, updateQuestionnaireDispatch } = this.props;
        let { participants, id } = questionnaire;
        participants = participants.filter((elem: string) => {
            return elem !== participantId;
        });

        questionnaire.participants = participants;

        updateQuestionnaireDispatch(id, questionnaire);
        this.setState({
            participantList: this.state.participantList.filter((elem: ParticipantListPerson) => {
                return elem.participantId !== participantId;
            }),
            isLoading: false
        });
    };

    UNSAFE_componentWillReceiveProps() {
        this.setState({ isLoading: true });
        this.load();
    }

    UNSAFE_componentWillMount() {
        this.setState({ isLoading: true });
        this.load();
    }

    componentDidMount() {
        this._isMounted = true;
    }
    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {
        let { participantList, editing, isLoading, error } = this.state;

        return (
            <>
                <IonList>
                    <IonItem color='light' key='header'>
                        <IonCol size='2'>
                            <IonLabel>Respondent</IonLabel>
                        </IonCol>
                        <IonCol size='1.5'>
                            <IonLabel>Name</IonLabel>
                        </IonCol>
                        <IonCol size='2.5'>
                            <IonLabel>Email</IonLabel>
                        </IonCol>
                        <IonCol size='1.5'>
                            <IonLabel>Phone Number</IonLabel>
                        </IonCol>
                        <IonCol size='1.5'>
                            <IonLabel>Account Created</IonLabel>
                        </IonCol>
                        <IonCol size='1.25'>
                            <IonLabel>Date Registered</IonLabel>
                        </IonCol>
                        <IonCol size='.75'>
                            <IonLabel>Enabled</IonLabel>
                        </IonCol>
                        <IonCol size='1'></IonCol>
                    </IonItem>
                    {!isLoading &&
                        participantList.map((participant: ParticipantListPerson, index: number) => {
                            let {
                                participantId,
                                active,
                                created,
                                dateCreated,
                                firstName,
                                lastName,
                                userName,
                                phoneNumber,
                                optedOut
                            } = participant;
                            return (
                                <IonItem key={index} color={optedOut ? 'medium' : ''}>
                                    <IonCol size='2'>
                                        <IonLabel>
                                            {participantId} {optedOut ? ' (Opted Out)' : ''}
                                        </IonLabel>
                                    </IonCol>
                                    <IonCol size='1.5'>
                                        {firstName} {lastName}
                                    </IonCol>
                                    <IonCol size='2.5'>{userName}</IonCol>
                                    <IonCol size='1.5'>{phoneNumber}</IonCol>
                                    <IonCol size='1.5'>
                                        <IonLabel>{created ? 'Yes' : 'No'}</IonLabel>
                                    </IonCol>
                                    <IonCol size='1.25'>
                                        <IonLabel>
                                            {!isEmptyObject(dateCreated)
                                                ? format(new Date(dateCreated), dateFormats.MM_dd_yyyy)
                                                : ''}
                                        </IonLabel>
                                    </IonCol>
                                    <IonCol size='.75'>
                                        <IonCheckbox
                                            id={`${participantId}-cb`}
                                            title='enabled'
                                            color='primary'
                                            checked={active}
                                            disabled={!editing.includes(participantId)}
                                        />
                                    </IonCol>
                                    <IonCol size='1'>
                                        <IonButton
                                            color='danger'
                                            onClick={(e: any) => this.delete(participantId)}>
                                            <strong>Remove</strong>
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
                {isEmptyObject(participantList) && !isLoading && (
                    <IonCard style={{ textAlign: 'center' }}>
                        <IonCardContent>No respondents have been added to this questionnaire.</IonCardContent>
                    </IonCard>
                )}
            </>
        );
    }
}

function mapStateToProps(state: any) {
    return {
        questionnaire: state.questionnaire
    };
}

function mapDispatchToProps(dispatch: any) {
    return {
        updateQuestionnaireDispatch(questionnaireId: string, questionnaire: any) {
            dispatch(updateQuestionnaire(questionnaireId, questionnaire));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Q13ParticipantList);
