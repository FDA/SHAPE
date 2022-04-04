import React from 'react';
import {connect} from 'react-redux';
import {
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonInput,
    IonLabel,
    IonText,
    IonList,
    IonItem,
    IonButton,
    IonCheckbox,
    IonRow,
    IonCol,
    IonTextarea,
    IonToast
} from '@ionic/react';
import {isEmptyObject, participantQuery} from '../utils/Utils';
import {withRouter, RouteComponentProps, Redirect} from 'react-router-dom';
import {
    getSurveys,
    getQuestionnaires,
    sendEmailNotification,
    sendTextNotification,
    addNotificationToDatabase,
    sendToInbox
} from '../utils/API';
import Loading from '../layout/Loading';
import {subYears, format, formatISO} from 'date-fns';
import {
    Survey,
    Questionnaire,
    User,
    UserAuthenticationObject
} from '../interfaces/DataTypes';
import {dateFormats, routes} from '../utils/Constants';
import {NotificationParticipantList, NotificationFilters} from './components';

interface StateProps {
    survey: Survey;
    questionnaire: Questionnaire;
    text: string;
    result: string;
    participantList: Array<User>;
    checkedEmailList: Array<User>;
    checkedSMSList: Array<User>;
    checkedInAppList: Array<User>;
    allEmailChecked: boolean;
    allSMSChecked: boolean;
    allInAppChecked: boolean;
    message: string;
    surveys: Array<Survey>;
    questionnaires: Array<Questionnaire>;
    age: {lower: number; upper: number};
    gender: {gender: string; operator: string; isDate: boolean};
    subject: string;
    failure: boolean;
    showToast: boolean;
    isLoading: boolean;
}

interface NCProps extends RouteComponentProps {
    authentication: UserAuthenticationObject;
}

class NotificationCreator extends React.Component<NCProps, StateProps> {
    constructor(props: NCProps) {
        super(props);
        this.state = {
            failure: false,
            survey: null,
            questionnaire: null,
            text: '',
            result: '',
            message: '',
            subject: '',
            participantList: [],
            checkedEmailList: [],
            checkedSMSList: [],
            checkedInAppList: [],
            allEmailChecked: false,
            allSMSChecked: false,
            allInAppChecked: false,
            surveys: [],
            questionnaires: [],
            age: {lower: 0, upper: 0},
            gender: {gender: '', operator: 'equals', isDate: false},
            showToast: false,
            isLoading: false
        };
    }

    setSurvey = (survey: Survey) => {
        let questionnaireList: Array<Questionnaire> = [];
        if (!isEmptyObject(survey)) {
            getQuestionnaires(survey.id)
                .then((snapshot: any) => {
                    return new Promise((resolve, reject) => {
                        snapshot.forEach((doc: any) => {
                            let questionnaire = doc.data;
                            questionnaire.id = doc.id;
                            questionnaireList.push(questionnaire);
                        });
                        resolve();
                    });
                })
                .then(() => {
                    this.setState({
                        questionnaires: questionnaireList
                    });
                })
                .catch((err: any) => {
                    console.error(err);
                });
            this.setState({survey: survey});
        } else {
            this.setState({
                questionnaires: []
            });
        }
    };

    setQuestionnaire = (questionnaire: Questionnaire) => {
        this.setState({questionnaire: questionnaire});
    };

    setAge = (val: {lower: number; upper: number}) => {
        this.setState({age: val});
    };

    setGender = (val: string) => {
        let {gender} = this.state;
        this.setState({gender: {...gender, gender: val}});
    };

    setText = (text: string) => {
        this.setState({text: text});
    };

    setSubject = (subject: string) => {
        this.setState({subject: subject});
    };

    setMessage = (message: string) => {
        this.setState({message: message});
    };

    setSMSChecked = (participant: User, checked: boolean) => {
        let {checkedSMSList} = this.state;
        if (checked) {
            checkedSMSList.push(participant);
            this.setState({checkedSMSList: checkedSMSList});
        } else {
            checkedSMSList = checkedSMSList.filter((elem: User) => {
                return elem.docId !== participant.docId;
            });
            this.setState({checkedSMSList: checkedSMSList});
        }
    };

    setInAppChecked = (participant: User, checked: boolean) => {
        let {checkedInAppList} = this.state;
        if (checked) {
            checkedInAppList.push(participant);
            this.setState({checkedInAppList: checkedInAppList});
        } else {
            checkedInAppList = checkedInAppList.filter((elem: User) => {
                return elem.docId !== participant.docId;
            });
            this.setState({checkedInAppList: checkedInAppList});
        }
    };

    setEmailChecked = (participant: User, checked: boolean) => {
        let {checkedEmailList} = this.state;
        if (checked) {
            checkedEmailList.push(participant);
            this.setState({checkedEmailList: checkedEmailList});
        } else {
            checkedEmailList = checkedEmailList.filter((elem: User) => {
                return elem.docId !== participant.docId;
            });
            this.setState({checkedEmailList: checkedEmailList});
        }
    };

    checkAllEmail = () => {
        let {participantList, allEmailChecked, checkedEmailList} = this.state;
        let filteredParticipantList = participantList.filter((elem: User) => {
            return elem.emailEnabled;
        });

        // add new elements
        if (!allEmailChecked) {
            filteredParticipantList.forEach((elem: User) => {
                let filteredList = checkedEmailList.filter((e: User) => {
                    return elem.docId === e.docId;
                });
                if (filteredList.length === 0) {
                    checkedEmailList.push(elem);
                }
            });
            this.setState({
                checkedEmailList: checkedEmailList,
                allEmailChecked: true
            });
        } else {
            // remove elements currently displayed
            let filteredList = checkedEmailList.filter((e: User) => {
                return (
                    filteredParticipantList.filter((elem: User) => {
                        return elem.docId === e.docId;
                    }).length === 0
                );
            });

            this.setState({
                checkedEmailList: filteredList,
                allEmailChecked: false
            });
        }
    };

    checkAllInApp = () => {
        let {participantList, allInAppChecked, checkedInAppList} = this.state;
        let filteredParticipantList = participantList.filter((elem: User) => {
            return elem.pushEnabled;
        });

        // add new elements
        if (!allInAppChecked) {
            filteredParticipantList.forEach((elem: User) => {
                let filteredList = checkedInAppList.filter((e: User) => {
                    return elem.docId === e.docId;
                });
                if (filteredList.length === 0) {
                    checkedInAppList.push(elem);
                }
            });
            this.setState({
                checkedInAppList: checkedInAppList,
                allInAppChecked: true
            });
        } else {
            // remove elements currently displayed
            let filteredList = checkedInAppList.filter((e: User) => {
                return (
                    filteredParticipantList.filter((elem: User) => {
                        return elem.docId === e.docId;
                    }).length === 0
                );
            });

            this.setState({
                checkedInAppList: filteredList,
                allInAppChecked: false
            });
        }
    };

    checkAllSMS = () => {
        let {participantList, allSMSChecked, checkedSMSList} = this.state;
        let filteredParticipantList = participantList.filter((elem: User) => {
            return elem.smsEnabled;
        });

        // add new elements
        if (!allSMSChecked) {
            filteredParticipantList.forEach((elem: User) => {
                let filteredList = checkedSMSList.filter((e: User) => {
                    return elem.docId === e.docId;
                });
                if (filteredList.length === 0) {
                    checkedSMSList.push(elem);
                }
            });
            this.setState({
                checkedSMSList: checkedSMSList,
                allSMSChecked: true
            });
        } else {
            // remove elements currently displayed
            let filteredList = checkedSMSList.filter((e: User) => {
                return (
                    filteredParticipantList.filter((elem: User) => {
                        return elem.docId === e.docId;
                    }).length === 0
                );
            });

            this.setState({checkedSMSList: filteredList, allSMSChecked: false});
        }
    };

    filterForRespondents = () => {
        let {survey, questionnaire, age, gender} = this.state;
        this.setState({isLoading: true});
        let list: any = [];
        if (!(age.lower === 0 && age.upper === 0)) {
            let upper = age.upper;
            let lower = age.lower;
            let upperAge = {
                dob: format(subYears(new Date(), upper), dateFormats.MMddyyyy),
                operator: 'greaterThanOrEqualTo',
                isDate: true
            };
            console.log(upperAge);
            let lowerAge = {
                dob: format(subYears(new Date(), lower), dateFormats.MMddyyyy),
                operator: 'lessThanOrEqualTo',
                isDate: true
            };
            console.log(lowerAge);

            list.push(lowerAge);
            list.push(upperAge);
        }

        if (!isEmptyObject(gender.gender)) {
            list.push(gender);
        }

        console.log(survey);
        let surveyId = !isEmptyObject(survey) ? survey.id : null;
        let questionnaireId = !isEmptyObject(questionnaire)
            ? questionnaire.id
            : null;

        // age would be converted to dob depending on current time and number provided
        participantQuery(surveyId, questionnaireId, list)
            .then((res: any) => {
                this.setState({participantList: res, isLoading: false});
            })
            .catch((err: any) => {
                console.error(err);
            });
    };

    sendNotifications = () => {
        this.setState({isLoading: true});
        let {
            message,
            checkedEmailList,
            subject,
            checkedSMSList,
            checkedInAppList
        } = this.state;
        let timestamp = formatISO(new Date());
        if (!isEmptyObject(message) && !isEmptyObject(subject)) {
            let data = {
                subject: subject,
                message: message,
                timestamp: timestamp,
                emailRecipients: checkedEmailList,
                smsRecipients: checkedSMSList,
                pushRecipients: checkedInAppList
            };

            addNotificationToDatabase(data)
                .then(() => {
                    if (!isEmptyObject(checkedEmailList)) {
                        sendEmailNotification(data);
                    }

                    if (!isEmptyObject(checkedSMSList)) {
                        let phoneNums = checkedSMSList.map(
                            (e: any) => e.phoneNumber
                        );
                        let formattedPhoneNums = phoneNums.map(
                            (number: string) => {
                                return '+1' + number.replace(/[^0-9]/g, '');
                            }
                        );

                        sendTextNotification(
                            subject,
                            message,
                            formattedPhoneNums
                        ).catch((e) => {
                            console.error(
                                'Error in sending SMS notifications: ' + e
                            );
                        });
                    }

                    if (!isEmptyObject(checkedInAppList)) {
                        let participantIds = checkedInAppList.map(
                            (e: User) => e.participantId
                        );
                        let deviceTokens = checkedInAppList
                            .filter((participant: User) => {
                                return (
                                    participant.pushEnabled === true &&
                                    !isEmptyObject(participant.token)
                                );
                            })
                            .map((e: User) => e.token);
                        sendToInbox(
                            subject,
                            message,
                            timestamp,
                            participantIds,
                            deviceTokens
                        ).catch((e: any) => {
                            console.error('Error in adding to inbox: ' + e);
                        });
                    }

                    participantQuery('', '', [])
                        .then((res: any) => {
                            this.setState({
                                survey: null,
                                questionnaire: null,
                                text: '',
                                result: '',
                                message: '',
                                subject: '',
                                participantList: res,
                                checkedEmailList: [],
                                checkedSMSList: [],
                                checkedInAppList: [],
                                questionnaires: [],
                                age: {lower: 0, upper: 0},
                                gender: {
                                    gender: '',
                                    operator: 'equals',
                                    isDate: false
                                },
                                allEmailChecked: false,
                                allSMSChecked: false,
                                allInAppChecked: false,
                                failure: false,
                                showToast: true,
                                isLoading: false
                            });
                        })
                        .catch((error: any) => {
                            console.error(error);
                        });
                })
                .catch((error: any) => {
                    console.error(error);
                });
        } else {
            this.setState({failure: true});
        }
    };

    clearFilters = () => {
        this.setState({
            isLoading: true,
            survey: null,
            questionnaire: null,
            questionnaires: [],
            age: {lower: 0, upper: 0},
            gender: {gender: '', operator: 'equals', isDate: false}
        });
        participantQuery('', '', [])
            .then((res: any) => {
                this.setState({
                    participantList: res,
                    isLoading: false
                });
            })
            .catch((error: any) => {
                console.error(error);
            });
    };

    UNSAFE_componentWillMount = () => {
        let surveys: Array<Survey> = [];
        this.setState({isLoading: true});
        getSurveys().then((snapshot: any) => {
            snapshot.forEach((doc: any) => {
                let tempSurvey = doc.data;
                tempSurvey.id = doc.id;
                surveys.push(tempSurvey);
            });

            this.setState({surveys: surveys});
        });

        participantQuery('', '', [])
            .then((res: any) => {
                this.setState({participantList: res, isLoading: false});
            })
            .catch((err: any) => {
                console.error(err);
            });
    };

    render() {
        let {
            survey,
            questionnaire,
            participantList,
            checkedEmailList,
            checkedInAppList,
            checkedSMSList,
            message,
            surveys,
            questionnaires,
            age,
            gender,
            subject,
            allEmailChecked,
            allSMSChecked,
            allInAppChecked,
            failure,
            showToast,
            isLoading
        } = this.state;

        let {loggedIn} = this.props.authentication;
        if (!loggedIn) return <Redirect to={routes.HOME} />;
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonBackButton defaultHref={routes.HOME} />
                        </IonButtons>
                        <IonTitle>Create New Notification</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <IonHeader>
                        <IonToolbar color="light">
                            <IonTitle>Subject</IonTitle>
                        </IonToolbar>
                    </IonHeader>
                    <IonInput
                        value={subject}
                        placeholder="Enter subject line..."
                        onIonChange={(e) =>
                            this.setSubject(e.detail.value)
                        }></IonInput>
                    <IonHeader>
                        <IonToolbar color="light">
                            <IonTitle>Message</IonTitle>
                        </IonToolbar>
                    </IonHeader>
                    <IonTextarea
                        placeholder="Enter message here..."
                        value={message}
                        onIonChange={(e) => this.setMessage(e.detail.value)}
                        rows={5}></IonTextarea>
                    <NotificationFilters
                        survey={survey}
                        questionnaire={questionnaire}
                        surveys={surveys}
                        questionnaires={questionnaires}
                        age={age}
                        gender={gender}
                        setSurvey={this.setSurvey}
                        setQuestionnaire={this.setQuestionnaire}
                        setGender={this.setGender}
                        filterForRespondents={this.filterForRespondents}
                        clearFilter={this.clearFilters}
                        setAge={this.setAge}
                        clearFilters={this.clearFilters}
                    />
                    <br />
                    <br />
                    <IonHeader>
                        <IonToolbar color="light">
                            <IonTitle>Select Respondent(s)</IonTitle>
                        </IonToolbar>
                    </IonHeader>
                    <IonList>
                        <IonItem>
                            <IonCol size="1">Email</IonCol>
                            <IonCol size="1">SMS</IonCol>
                            <IonCol size="1">In-App</IonCol>
                        </IonItem>
                        <IonItem color="light" style={{width: '100%'}}>
                            <IonCol size="1">
                                <IonCheckbox
                                    checked={allEmailChecked}
                                    onClick={() => this.checkAllEmail()}
                                />
                            </IonCol>
                            <IonCol size="1">
                                <IonCheckbox
                                    checked={allSMSChecked}
                                    onClick={() => this.checkAllSMS()}
                                />
                            </IonCol>
                            <IonCol size="1">
                                <IonCheckbox
                                    checked={allInAppChecked}
                                    onClick={() => this.checkAllInApp()}
                                />
                            </IonCol>
                            <IonCol size="2">
                                <IonLabel>Respondent ID</IonLabel>
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
                            <IonCol size="2">
                                <IonLabel>Phone Number</IonLabel>
                            </IonCol>
                            <IonCol size="1">
                                <IonLabel>Enabled</IonLabel>
                            </IonCol>
                        </IonItem>
                        {isLoading && (
                            <IonRow text-center>
                                <IonCol size="12" style={{textAlign: 'center'}}>
                                    <Loading />
                                </IonCol>
                            </IonRow>
                        )}
                        {!isEmptyObject(participantList) && !isLoading && (
                            <NotificationParticipantList
                                setEmailChecked={this.setEmailChecked}
                                setSMSChecked={this.setSMSChecked}
                                setInAppChecked={this.setInAppChecked}
                                participantList={participantList}
                                checkedEmailList={checkedEmailList}
                                checkedSMSList={checkedSMSList}
                                checkedInAppList={checkedInAppList}
                                allEmailChecked={allEmailChecked}
                                allSMSChecked={allSMSChecked}
                                allInAppChecked={allInAppChecked}
                            />
                        )}
                        {isEmptyObject(participantList) && !isLoading && (
                            <IonItem>
                                <IonText
                                    color="medium"
                                    style={{
                                        width: '100%',
                                        textAlign: 'center'
                                    }}>
                                    Empty
                                </IonText>
                            </IonItem>
                        )}
                    </IonList>
                    {failure && (
                        <IonText color="danger">
                            All required fields are not filled.
                        </IonText>
                    )}
                    <IonButton
                        size="small"
                        disabled={
                            checkedEmailList.length === 0 &&
                            checkedSMSList.length === 0 &&
                            checkedInAppList.length === 0
                        }
                        onClick={() => this.sendNotifications()}
                        expand="full">
                        Send Notification(s)
                    </IonButton>
                    <IonToast
                        isOpen={showToast}
                        onDidDismiss={() => {
                            this.setState({showToast: false});
                        }}
                        message={'Notification successfully sent'}
                        duration={10000}
                        buttons={[
                            {
                                text: 'Close',
                                role: 'cancel'
                            }
                        ]}
                    />
                </IonContent>
            </IonPage>
        );
    }
}

function mapStateToProps(state: any) {
    return {
        authentication: state.authentication
    };
}

export default withRouter(connect(mapStateToProps)(NotificationCreator));
