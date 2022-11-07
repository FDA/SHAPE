import React from 'react';
import { connect } from 'react-redux';
import {
    IonHeader,
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
import { isEmptyObject, participantQuery } from '../utils/Utils';
import { withRouter, RouteComponentProps, Redirect } from 'react-router-dom';
import { getSurveys } from '../utils/API';
import Loading from '../layout/Loading';
import { Survey, Questionnaire, User, UserAuthenticationObject } from '../interfaces/DataTypes';
import { routes } from '../utils/Constants';
import { NotificationParticipantList, NotificationFilters } from './components';
import {
    setSurvey,
    setQuestionnaire,
    setAge,
    setGender,
    setMessage,
    setSubject,
    setSMSChecked,
    setInAppChecked,
    setEmailChecked,
    checkAllEmail,
    checkAllInApp,
    checkAllSMS,
    filterForRespondents,
    sendNotifications,
    clearFilters
} from './NotificationCreatorFactory';

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
    age: { lower: number; upper: number };
    gender: { gender: string; operator: string; isDate: boolean };
    subject: string;
    failure: boolean;
    showToast: boolean;
    isLoading: boolean;
}

interface NCProps extends RouteComponentProps {
    authentication: UserAuthenticationObject;
    org: string;
}

class NotificationCreatorPrivate extends React.Component<NCProps, StateProps> {
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
            age: { lower: 0, upper: 0 },
            gender: { gender: '', operator: 'equals', isDate: false },
            showToast: false,
            isLoading: false
        };
    }

    UNSAFE_componentWillMount = () => {
        let surveys: Array<Survey> = [];
        this.setState({ isLoading: true });
        getSurveys().then((snapshot: any) => {
            snapshot.forEach((doc: any) => {
                let tempSurvey = doc.data;
                tempSurvey.id = doc.id;
                if (!tempSurvey.public && tempSurvey.open) surveys.push(tempSurvey);
            });

            this.setState({ surveys: surveys });

            participantQuery('', '', [])
                .then((res: any) => {
                    if (res.length > 0) {
                        this.setState({
                            participantList: res.sort((p1: any, p2: any) =>
                                p1.firstName > p2.firstName ? 1 : -1
                            ),
                            isLoading: false
                        });
                    } else {
                        this.setState({
                            isLoading: false
                        });
                    }
                })
                .catch((err: any) => {
                    console.error(err);
                });
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

        let { org } = this.props;

        let { loggedIn } = this.props.authentication;
        if (!loggedIn) return <Redirect to={routes.HOME} />;
        return (
            <>
                <IonHeader role='generic'>
                    <IonToolbar color='light'>
                        <IonTitle>Subject/Message</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonHeader role='generic'>
                    <IonToolbar color='light'>
                        <IonItem>
                            <IonLabel color='primary' position='fixed'>
                                Subject:
                            </IonLabel>
                            <IonInput
                                value={subject}
                                placeholder='Enter subject line...'
                                onIonChange={(e) => setSubject(this, e.detail.value)}></IonInput>
                        </IonItem>
                    </IonToolbar>
                </IonHeader>
                <IonHeader role='generic'>
                    <IonToolbar color='light'>
                        <IonItem>
                            <IonLabel color='primary' position='fixed'>
                                Message:
                            </IonLabel>
                            <IonTextarea
                                placeholder='Enter message here...'
                                value={message}
                                onIonChange={(e) => setMessage(this, e.detail.value)}
                                rows={5}></IonTextarea>
                        </IonItem>
                    </IonToolbar>
                </IonHeader>

                <NotificationFilters
                    parent={this}
                    survey={survey}
                    questionnaire={questionnaire}
                    surveys={surveys}
                    questionnaires={questionnaires}
                    age={age}
                    gender={gender}
                    setSurvey={setSurvey}
                    setQuestionnaire={setQuestionnaire}
                    setGender={setGender}
                    filterForRespondents={filterForRespondents}
                    setAge={setAge}
                    clearFilters={clearFilters}
                />
                <br />
                <br />
                <IonHeader role='generic'>
                    <IonToolbar color='light'>
                        <IonTitle>Select Respondent(s)</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonList>
                    <IonItem>
                        <IonCol size='1'>Email</IonCol>
                        <IonCol size='1'>SMS</IonCol>
                        <IonCol size='1'>In-App</IonCol>
                    </IonItem>
                    <IonItem color='light' style={{ width: '100%' }}>
                        <IonCol size='1'>
                            <IonCheckbox
                                title='Email'
                                checked={allEmailChecked}
                                onClick={() =>
                                    checkAllEmail(this, participantList, allEmailChecked, checkedEmailList)
                                }
                            />
                        </IonCol>
                        <IonCol size='1'>
                            <IonCheckbox
                                title='SMS'
                                checked={allSMSChecked}
                                onClick={() =>
                                    checkAllSMS(this, participantList, allSMSChecked, checkedSMSList)
                                }
                            />
                        </IonCol>
                        <IonCol size='1'>
                            <IonCheckbox
                                title='In App'
                                checked={allInAppChecked}
                                onClick={() =>
                                    checkAllInApp(this, participantList, allInAppChecked, checkedInAppList)
                                }
                            />
                        </IonCol>
                        <IonCol size='2'>
                            <IonLabel>Respondent ID</IonLabel>
                        </IonCol>
                        <IonCol size='1'>
                            <IonLabel>First Name</IonLabel>
                        </IonCol>
                        <IonCol size='1'>
                            <IonLabel>Last Name</IonLabel>
                        </IonCol>
                        <IonCol size='2'>
                            <IonLabel>Email</IonLabel>
                        </IonCol>
                        <IonCol size='2'>
                            <IonLabel>Phone Number</IonLabel>
                        </IonCol>
                        <IonCol size='1'>
                            <IonLabel>Enabled</IonLabel>
                        </IonCol>
                    </IonItem>
                    {isLoading && (
                        <IonRow text-center>
                            <IonCol size='12' style={{ textAlign: 'center' }}>
                                <Loading />
                            </IonCol>
                        </IonRow>
                    )}
                    {!isEmptyObject(participantList) && !isLoading && (
                        <NotificationParticipantList
                            parent={this}
                            setEmailChecked={setEmailChecked}
                            setSMSChecked={setSMSChecked}
                            setInAppChecked={setInAppChecked}
                            participantList={participantList}
                            checkedEmailList={checkedEmailList}
                            checkedSMSList={checkedSMSList}
                            checkedInAppList={checkedInAppList}
                            allEmailChecked={allEmailChecked}
                            allSMSChecked={allSMSChecked}
                            allInAppChecked={allInAppChecked}
                            org={org}
                        />
                    )}
                    {isEmptyObject(participantList) && !isLoading && (
                        <IonItem>
                            <IonText
                                color='medium'
                                style={{
                                    width: '100%',
                                    textAlign: 'center'
                                }}>
                                Empty
                            </IonText>
                        </IonItem>
                    )}
                </IonList>
                {failure && <IonText color='danger'>All required fields are not filled.</IonText>}
                <IonButton
                    size='small'
                    disabled={
                        checkedEmailList.length === 0 &&
                        checkedSMSList.length === 0 &&
                        checkedInAppList.length === 0
                    }
                    onClick={() =>
                        sendNotifications(
                            this,
                            subject,
                            message,
                            checkedEmailList,
                            checkedSMSList,
                            checkedInAppList,
                            org,
                            false
                        )
                    }
                    expand='full'>
                    Send Notification(s)
                </IonButton>
                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => {
                        this.setState({ showToast: false });
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
            </>
        );
    }
}

function mapStateToProps(state: any) {
    return {
        authentication: state.authentication,
        org: state.firebase.profile.org
    };
}

export default withRouter(connect(mapStateToProps)(NotificationCreatorPrivate));
