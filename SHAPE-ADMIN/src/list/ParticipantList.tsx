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
import React, {Component} from 'react';
import {
    editUser,
    getParticipant,
    getUser,
    disableUser,
    enableUser,
    getQuestionnaires
} from '../utils/API';
import {isEmptyObject} from '../utils/Utils';
import {connect} from 'react-redux';
import Loading from '../layout/Loading';
import {updateSurvey} from '../redux/actions/Survey';
import {updateQuestionnaire} from '../redux/actions/Questionnaire';
import {Survey} from '../interfaces/DataTypes';

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
        let {survey} = this.props;

        let participants = !isEmptyObject(survey.participants)
            ? survey.participants
            : [];

        let promises = participants.map((participantId: string) => {
            return new Promise<void>((resolve, reject) => {
                getParticipant(participantId)
                    .then((doc: any) => {
                        let tempDoc = doc.data;
                        tempDoc.id = doc.id;
                        getUser(participantId)
                            .then((snapshot: any) => {
                                if (snapshot.length > 0) {
                                    snapshot.forEach((snap: any) => {
                                        let data = snap.data;
                                        tempDoc.active = data.active;
                                        tempDoc.created = true;
                                        tempDoc.userId = snap.id;
                                        tempDoc.dateCreated = data.dateCreated;
                                        tempDoc.firstName = data.firstName;
                                        tempDoc.lastName = data.lastName;
                                        tempDoc.userName = data.userName;
                                        tempDoc.phoneNumber = data.phoneNumber;
                                        tempDoc.optedOut = !isEmptyObject(
                                            data.optedOut
                                        )
                                            ? data.optedOut
                                            : false;
                                        participantList.push(tempDoc);
                                        resolve();
                                    });
                                } else {
                                    tempDoc.created = false;
                                    participantList.push(tempDoc);
                                    resolve();
                                }
                            })
                            .catch((e: any) => {
                                throw Error(e);
                            });
                    })
                    .catch((e: any) => {
                        console.error(e);
                        if(parent._isMounted){
                            parent.setState({
                                isLoading: false,
                                error: true
                            });
                        }
                        resolve();
                    });
            });
        });

        Promise.all(promises)
            .then(() => {
                if(parent._isMounted){
                    parent.setState({
                        participantList: participantList,
                        isLoading: false,
                        error: false
                    });
                }
            })
            .catch((err) => {
                console.error(err);
                if(parent._isMounted){
                    this.setState({isLoading: false, error: true});
                }
            });
    }

    UNSAFE_componentWillReceiveProps() {
        this.setState({isLoading: true});
        this.load();
    }

    componentDidMount() {
        this._isMounted = true;
        this.setState({isLoading: true});
        this.load();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    delete = (participantId: string) => {
        this.setState({isLoading: true});
        let {
            survey,
            updateSurveyDispatch,
            updateQuestionnaireDispatch
        } = this.props;
        let {participants, id} = survey;
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
                        questionnaireParticipants = questionnaireParticipants.filter(
                            (elem: string) => {
                                return elem !== participantId;
                            }
                        );
                        questionnaire.participants = questionnaireParticipants;
                        updateQuestionnaireDispatch(doc.id, questionnaire);
                        this.setState({isLoading: false});
                    }
                });
            })
            .catch((err: any) => {
                console.error('Error getting documents', err);
                this.setState({isLoading: false});
            });
    };

    render() {
        let {participantList, isLoading, error} = this.state;
        let {open, locked} = this.props.survey;
        
        let disable = (id: string) => {
            this.setState({isLoading: true});
            disableUser(id)
                .then(() => {
                    editUser(id, {active: false})
                        .then(() => {
                            this.load();
                        });
                })
                .catch((err: any) => {
                    console.error(err);
                    this.setState({isLoading: false});
                });
        };

        let enable = (id: string) => {
            this.setState({isLoading: true});
            enableUser(id)
                .then(() => {
                    editUser(id, {active: true})
                        .then(() => {
                            this.load();
                        });
                })
                .catch((err: any) => {
                    console.error(err);
                    this.setState({isLoading: false});
                });
        };

        return (
            <>
                <IonList>
                    <IonItem color="light">
                        <IonCol size="2">
                            <IonLabel>Respondent</IonLabel>
                        </IonCol>
                        <IonCol size="1">
                            <IonLabel>First Name</IonLabel>
                        </IonCol>
                        <IonCol size="1">
                            <IonLabel>Last Name</IonLabel>
                        </IonCol>
                        <IonCol size="2">
                            <IonLabel>Email</IonLabel>
                        </IonCol>
                        <IonCol size="1">
                            <IonLabel>Phone Number</IonLabel>
                        </IonCol>
                        <IonCol size="1">
                            <IonLabel>Account Created</IonLabel>
                        </IonCol>
                        <IonCol size="1">
                            <IonLabel>Date Registered</IonLabel>
                        </IonCol>
                        <IonCol size="1">
                            <IonLabel>Enabled</IonLabel>
                        </IonCol>
                        <IonCol size="2"></IonCol>
                    </IonItem>
                    {!isLoading &&
                        participantList.map((participant: any) => {
                            let {
                                userId,
                                id,
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
                                <IonItem
                                    key={id}
                                    color={optedOut ? 'medium' : ''}>
                                    <IonCol size="2">
                                        <IonText>
                                            {participantId}{' '}
                                            {optedOut ? ' (Opted Out)' : ''}
                                        </IonText>
                                    </IonCol>
                                    <IonCol size="1">
                                        <IonLabel>{firstName}</IonLabel>
                                    </IonCol>
                                    <IonCol size="1">
                                        <IonLabel>{lastName}</IonLabel>
                                    </IonCol>
                                    <IonCol size="2">
                                        <IonLabel>{userName}</IonLabel>
                                    </IonCol>
                                    <IonCol size="1">
                                        <IonLabel>{phoneNumber}</IonLabel>
                                    </IonCol>
                                    <IonCol size="1">
                                        <IonLabel>
                                            {created ? 'Yes' : 'No'}
                                        </IonLabel>
                                    </IonCol>
                                    <IonCol size="1">
                                        <IonLabel>
                                            {!isEmptyObject(dateCreated)
                                                ? dateCreated
                                                : ''}
                                        </IonLabel>
                                    </IonCol>
                                    <IonCol size="1">
                                        <IonCheckbox
                                            id={`${participantId}-cb`}
                                            color="primary"
                                            checked={active}
                                            disabled={true}
                                        />
                                    </IonCol>
                                    <IonCol size="1">
                                        {active && (
                                            <IonButton
                                                expand="block"
                                                disabled={optedOut}
                                                onClick={() =>
                                                    disable(
                                                        userId
                                                    )
                                                }>
                                                Disable
                                            </IonButton>
                                        )}
                                        {!active && (
                                            <IonButton
                                                expand="block"
                                                disabled={optedOut}
                                                onClick={() =>
                                                    enable(
                                                        userId
                                                    )
                                                }>
                                                Enable
                                            </IonButton>
                                        )}
                                    </IonCol>
                                    <IonCol size="2">
                                        <IonButton
                                            color="danger"
                                            disabled={
                                                (!isEmptyObject(locked)
                                                    ? locked
                                                    : false) && !open
                                            }
                                            onClick={(e: any) =>
                                                this.delete(participantId)
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
                        <IonCol size="12" style={{textAlign: 'center'}}>
                            <Loading />
                        </IonCol>
                    </IonRow>
                )}
                {error && (
                    <IonCard style={{textAlign: 'center'}}>
                        <IonCardContent>
                            <IonText color="danger">
                                Error loading respondents. Try refreshing.
                            </IonText>
                        </IonCardContent>
                    </IonCard>
                )}
                {isEmptyObject(participantList) && !isLoading && (
                    <IonCard style={{textAlign: 'center'}}>
                        <IonCardContent>
                            No respondents have been added to this survey.
                        </IonCardContent>
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
        updateQuestionnaireDispatch(
            questionnaireId: string,
            questionnaire: any
        ) {
            dispatch(updateQuestionnaire(questionnaireId, questionnaire));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ParticipantList);
