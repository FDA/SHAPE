import React from 'react';
import AppHeader from '../layout/AppHeader';
import {
    IonAlert,
    IonBackButton,
    IonButton,
    IonButtons,
    IonCol,
    IonContent,
    IonFab,
    IonFabButton,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonPage,
    IonRow,
    IonText,
    IonTextarea
} from '@ionic/react';
import { connect } from 'react-redux';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { add } from 'ionicons/icons';
import { AppBar } from '@material-ui/core';
import { TabPanelProps } from '../interfaces/Components';
import Reorder from '../questionAction/Reorder';
import { isEmptyObject, getColor, guid } from '../utils/Utils';
import { getParticipant, getUserInfo, sendToInbox, deleteQuestionnaire } from '../utils/API';
import Q13ParticipantList from '../list/q13ParticipantList';
import { updateQuestionnaire, removeQuestionnaire } from '../redux/actions/Questionnaire';
import { ParticipantProgressPanel } from '../progressCharting';
import { formatISO } from 'date-fns';
import LoadingScreen from '../layout/LoadingScreen';
import { Questionnaire, Survey, User } from '../interfaces/DataTypes';
import { RouteComponentProps } from 'react-router';
import { PreviewButton, EditSaveCancelButton } from './components';
import { routes } from '../utils/Constants';
import { cloneDeep } from 'lodash';
import { disableScheduledJobs } from '../redux/actions/Survey';

interface StateProps {
    editing: boolean;
    editingQuestions: boolean;
    value: number;
    displayData: any;
    failure: boolean;
    showAlert: boolean;
    alertMessage: string;
    showOpenAlert: boolean;
    showCloseAlert: boolean;
    showArchiveAlert: boolean;
    showDeleteAlert: boolean;
    showNotificationAlert: boolean;
    token?: string;
    name: string;
    description: string;
    shortDescription: string;
}

interface ReduxProps extends RouteComponentProps {
    questionnaire: Questionnaire;
    survey: Survey;
    updateQuestionnaireDispatch: Function;
    firebase: any;
    isLoading: boolean;
    removeQuestionnaireDispatch: Function;
    disableScheduledJobsDispatch: Function;
    loggedIn: boolean;
}

class Q13Editor extends React.Component<ReduxProps, StateProps> {
    containerEl: any;
    externalWindow: any;
    previewUrl: any;

    constructor(props: ReduxProps) {
        super(props);
        this.state = {
            editing: false,
            editingQuestions: false,
            value: 0,
            displayData: <div />,
            failure: false,
            showAlert: false,
            alertMessage: '',
            showOpenAlert: false,
            showCloseAlert: false,
            showArchiveAlert: false,
            showNotificationAlert: false,
            showDeleteAlert: false,
            token: '',
            name: '',
            description: '',
            shortDescription: ''
        };
        this.containerEl = document.createElement('div');
        this.externalWindow = null;
        this.previewUrl = '';
    }

    UNSAFE_componentWillMount() {
        const { loggedIn } = this.props;

        if (!loggedIn) {
            this.props.history.push(routes.LOGIN);
        }
    }

    UNSAFE_componentWillReceiveProps(props: ReduxProps) {
        let { editing } = this.state;
        let questionnaire = cloneDeep(props.questionnaire);
        if (!editing) {
            this.setState({
                name: questionnaire.name,
                shortDescription: questionnaire.shortDescription,
                description: questionnaire.description
            });
        }
    }

    setShowAlert(bool: boolean, message: string = '') {
        this.setState({ showAlert: bool, alertMessage: message });
    }

    sendNotificationToQuestionnaire = () => {
        let { questionnaire } = this.props;
        let participants = questionnaire.participants;
        let org = questionnaire.org;
        let deviceTokens: Array<string> = [];
        let promises: any = [];
        let users: Array<User> = [];
        if (!isEmptyObject(participants) && !questionnaire.public) {
            participants.forEach((participantId: any) => {
                let promise = new Promise<void>((resolve, reject) => {
                    getParticipant(participantId)
                        .then(function (doc: any) {
                            let userId = doc.data.userId;
                            if (userId) {
                                getUserInfo(userId)
                                    .then((userDoc: any) => {
                                        let data = userDoc.data;
                                        data.docId = userDoc.id;
                                        users.push(data);
                                        if (!isEmptyObject(data.token)) deviceTokens.push(data.token);
                                        resolve();
                                    })
                                    .catch((err: any) => {
                                        console.error(err);
                                        resolve();
                                    });
                            } else {
                                resolve();
                            }
                        })
                        .catch((err: any) => {
                            resolve();
                        });
                });
                promises.push(promise);
            });

            Promise.all(promises)
                .then((res) => {
                    sendToInbox(
                        'New Questionnaire Available',
                        `${questionnaire.name} opened.`,
                        formatISO(new Date()),
                        users,
                        deviceTokens,
                        org
                    ).catch((e: any) => {
                        console.error('Error in adding to inbox: ' + e);
                    });
                })
                .catch((err: any) => {
                    console.error(err);
                });
        }

        if (!isEmptyObject(participants) && questionnaire.public) {
            participants.forEach((participantId: any) => {
                let promise = new Promise<void>((resolve, reject) => {
                    getUserInfo(participantId)
                        .then((doc: any) => {
                            let data = doc.data;
                            data.docId = doc.id;
                            users.push(data);
                            if (!isEmptyObject(data.token)) deviceTokens.push(data.token);
                            resolve();
                        })
                        .catch((err: any) => {
                            console.error(err);
                            resolve();
                        });
                });
                promises.push(promise);
            });

            Promise.all(promises)
                .then((res) => {
                    sendToInbox(
                        'New Questionnaire Available',
                        `${questionnaire.name} opened.`,
                        formatISO(new Date()),
                        users,
                        deviceTokens,
                        org
                    ).catch((e: any) => {
                        console.error('Error in adding to inbox: ' + e);
                    });
                })
                .catch((err: any) => {
                    console.error(err);
                });
        }
    };

    handleChange = (e: any, val: number) => {
        this.setState({ value: val });
    };

    edit = () => {
        this.setState({ editing: true });
    };

    save = () => {
        let { questionnaire } = this.props;
        const questionnaireId = questionnaire.id;

        let { name, shortDescription, description } = this.state;
        if (isEmptyObject(name)) name = questionnaire.name;
        if (isEmptyObject(shortDescription)) shortDescription = questionnaire.shortDescription;
        if (isEmptyObject(description)) description = questionnaire.description;

        if (!isEmptyObject(name) && !isEmptyObject(shortDescription) && !isEmptyObject(description)) {
            questionnaire.name = name;
            questionnaire.shortDescription = shortDescription;
            questionnaire.description = description;

            this.props.updateQuestionnaireDispatch(questionnaireId, questionnaire);
        } else {
            this.setState({ failure: true });
        }
        this.setState({ editing: false });
    };

    cancel = () => {
        this.setState({ editing: false });
    };

    archive = () => {
        this.setState({ showArchiveAlert: true });
    };

    deleteAction = () => {
        this.setState({ showDeleteAlert: true });
    };

    openQuestionEditor = () => {
        let { questionnaire } = this.props;
        const questionnaireId = questionnaire.id;

        this.props.history.push({
            pathname: routes.EDIT_QUESTIONS,
            state: { questionnaireId: questionnaireId }
        });
    };

    openAddParticipant = () => {
        let { questionnaire } = this.props;
        const questionnaireId = questionnaire.id;

        this.props.history.push({
            pathname: routes.NEW_Q13_PARTICIPANT,
            state: {
                questionnaire: questionnaire,
                questionnaireId: questionnaireId
            }
        });
    };

    addClicked = (e: any, value: number) => {
        if (value === 0) {
            this.openQuestionEditor();
        } else {
            this.openAddParticipant();
        }
    };

    open = () => {
        const { questionnaire, survey } = this.props;
        const { editingQuestions } = this.state;
        const variables: any = [];
        const questions = questionnaire.questions;
        for (var question in questions) {
            variables.push(questions[question].variable);
        }
        const findDuplicates = variables.filter((elem: any, index: number) => {
            return variables.indexOf(elem) !== index;
        });

        if (editingQuestions) {
            this.setShowAlert(
                true,
                'Unsaved changes to questions. Save all changes before opening this questionnaire.'
            );
        } else if (findDuplicates.length > 0) {
            this.setShowAlert(true, `Duplicate variable name: ${findDuplicates.toString()}`);
        } else if (variables.length === 0) {
            this.setShowAlert(true, 'No questions have been added.');
        } else if (!survey.open) {
            this.setShowAlert(true, 'Parent survey has not been opened.');
        } else {
            this.setState({ showOpenAlert: true });
        }
    };

    close = () => {
        this.setState({ showCloseAlert: true });
    };

    getOpenText = (open: boolean, locked: boolean) => {
        if (open) return 'Open';
        else if (locked) return 'Closed';
        else return 'Draft';
    };

    setEditingQuestions = (bool: boolean) => {
        this.setState({ editingQuestions: bool });
    };

    render() {
        const { questionnaire, survey } = this.props;
        const questionnaireId = questionnaire.id;
        const {
            value,
            showAlert,
            alertMessage,
            showOpenAlert,
            showCloseAlert,
            showArchiveAlert,
            showNotificationAlert,
            showDeleteAlert,
            name,
            shortDescription,
            description,
            editing
        } = this.state;

        const locked = !isEmptyObject(questionnaire.locked) ? questionnaire.locked : false;

        return (
            <IonPage>
                <AppHeader />
                <IonContent className='ion-padding' aria-label={`Q13-Content-${guid()}`}>
                    {this.props.isLoading && (
                        <IonRow text-center>
                            <IonCol size='12' style={{ textAlign: 'center' }}>
                                <LoadingScreen />
                            </IonCol>
                        </IonRow>
                    )}
                    <IonRow>
                        <IonCol>
                            <span style={{ float: 'left' }}>
                                <IonButtons>
                                    <IonBackButton defaultHref={`/survey/${questionnaire.surveyId}`} />
                                </IonButtons>
                            </span>
                        </IonCol>
                        <IonCol>
                            <IonText color='primary'>
                                <span style={{ float: 'right' }}>
                                    <IonButtons slot='end'>
                                        <IonButton
                                            disabled={locked || editing}
                                            color='primary'
                                            fill='clear'
                                            onClick={() => this.open()}>
                                            <b>Open</b>
                                        </IonButton>
                                        <IonButton
                                            disabled={!questionnaire.open}
                                            color='secondary'
                                            fill='clear'
                                            onClick={() => this.close()}>
                                            <b>Close</b>
                                        </IonButton>
                                        <PreviewButton />
                                        <EditSaveCancelButton
                                            edit={this.edit}
                                            save={this.save}
                                            cancel={this.cancel}
                                            editing={editing}
                                            locked={locked}
                                        />
                                        {locked && (
                                            <IonButton
                                                color='danger'
                                                onClick={() => this.archive()}
                                                disabled={questionnaire.open}>
                                                <b>Archive</b>
                                            </IonButton>
                                        )}
                                        {!locked && (
                                            <IonButton color='danger' onClick={() => this.deleteAction()}>
                                                <b>Delete</b>
                                            </IonButton>
                                        )}
                                    </IonButtons>
                                </span>
                            </IonText>
                        </IonCol>
                    </IonRow>
                    <IonRow>
                        <IonCol>
                            <IonItem>
                                <IonLabel color='primary'>Questionnaire Name</IonLabel>
                                <IonInput
                                    id='questionnaire-name'
                                    placeholder='Enter Input'
                                    value={name}
                                    readonly={!editing}
                                    onIonInput={(e: any) => {
                                        this.setState({
                                            name: e.target.value
                                        });
                                    }}
                                />
                            </IonItem>
                        </IonCol>
                        <IonCol>
                            <IonItem>
                                <IonLabel color='primary'>Subtitle</IonLabel>
                                <IonInput
                                    id='questionnaire-subtitle'
                                    placeholder='Questionnaire Subtitle'
                                    value={shortDescription}
                                    readonly={!editing}
                                    onIonInput={(e: any) => {
                                        this.setState({
                                            shortDescription: e.target.value
                                        });
                                    }}
                                />
                            </IonItem>
                        </IonCol>
                        <IonCol
                            style={{ backgroundColor: getColor(questionnaire.open, questionnaire.locked) }}>
                            <IonItem>
                                <IonLabel color='primary'>Status</IonLabel>
                                <IonInput
                                    id='questionnaire-status'
                                    placeholder='Questionnaire Status'
                                    value={this.getOpenText(questionnaire.open, questionnaire.locked)}
                                    readonly={true}
                                />
                            </IonItem>
                        </IonCol>
                    </IonRow>
                    <IonRow>
                        <IonCol>
                            <IonItem>
                                <IonLabel color='primary'>Description</IonLabel>
                                <IonTextarea
                                    id='questionnaire-description'
                                    rows={2}
                                    placeholder='Questionnaire Description'
                                    value={description}
                                    readonly={!editing}
                                    onIonChange={(e: any) => {
                                        this.setState({
                                            description: e.target.value
                                        });
                                    }}
                                />
                            </IonItem>
                        </IonCol>
                    </IonRow>
                    <AppBar style={{ backgroundColor: '#007CBA' }} position='static'>
                        <Tabs value={value} onChange={this.handleChange} aria-label='q13 tabs'>
                            <Tab label='Questions' {...a11yProps(0)} />
                            <Tab label='Respondents' {...a11yProps(1)} />
                            <Tab label='Progress' {...a11yProps(2)} />
                        </Tabs>
                    </AppBar>
                    <TabPanel value={value} index={0}>
                        <Reorder setEditingQuestions={this.setEditingQuestions} />
                    </TabPanel>
                    <TabPanel value={value} index={1}>
                        <Q13ParticipantList />
                    </TabPanel>
                    <TabPanel value={value} index={2}>
                        <ParticipantProgressPanel
                            view='questionnaire'
                            questionnaireId={`${this.props.questionnaire.id}`}
                        />
                    </TabPanel>
                    <IonFab vertical='bottom' horizontal='end' slot='fixed'>
                        {value === 0 && (
                            <IonFabButton disabled={locked} onClick={(e) => this.addClicked(e, value)}>
                                <IonIcon icon={add} title='Add' />
                            </IonFabButton>
                        )}
                        {value === 1 && (
                            <IonFabButton
                                disabled={!questionnaire.open && locked}
                                onClick={(e) => this.addClicked(e, value)}>
                                <IonIcon icon={add} title='Add' />
                            </IonFabButton>
                        )}
                    </IonFab>
                </IonContent>
                <IonAlert
                    isOpen={showAlert}
                    onDidDismiss={() => {
                        this.setShowAlert(false);
                    }}
                    header={'Error'}
                    message={alertMessage}
                    buttons={['OK']}
                />
                <IonAlert
                    isOpen={showOpenAlert}
                    onDidDismiss={() => {
                        this.setState({ showOpenAlert: false });
                    }}
                    header={'Open Questionnaire'}
                    message={
                        'Are you sure you are ready to open this questionnaire? You will not be permitted to make any further changes.'
                    }
                    buttons={[
                        {
                            text: 'Cancel',
                            role: 'cancel',
                            cssClass: 'secondary'
                        },
                        {
                            text: 'Yes',
                            handler: () => {
                                this.setState({ showNotificationAlert: true });
                            }
                        }
                    ]}
                />
                <IonAlert
                    isOpen={showNotificationAlert}
                    onDidDismiss={() => {
                        this.setState({ showNotificationAlert: false });
                    }}
                    header={'Send Notification'}
                    message={`Do you want to send a push notification and in-app message to all respondents associated with this questionnaire?`}
                    buttons={[
                        {
                            text: 'No',
                            cssClass: 'secondary',
                            handler: () => {
                                this.props.updateQuestionnaireDispatch(questionnaireId, {
                                    ...questionnaire,
                                    ...{
                                        open: true,
                                        locked: true
                                    }
                                });
                            }
                        },
                        {
                            text: 'Yes',
                            handler: () => {
                                this.sendNotificationToQuestionnaire();
                                this.props.updateQuestionnaireDispatch(questionnaireId, {
                                    ...questionnaire,
                                    ...{
                                        open: true,
                                        locked: true
                                    }
                                });
                            }
                        }
                    ]}
                />
                <IonAlert
                    isOpen={showCloseAlert}
                    onDidDismiss={() => {
                        this.setState({ showCloseAlert: false });
                    }}
                    header={'Close Questionnaire'}
                    message={
                        'Are you sure you want to close this questionnaire? Participants will no longer be able to edit their responses. This action cannot be undone.'
                    }
                    buttons={[
                        {
                            text: 'Cancel',
                            role: 'cancel',
                            cssClass: 'secondary'
                        },
                        {
                            text: 'Yes',
                            handler: () => {
                                this.props.updateQuestionnaireDispatch(questionnaireId, {
                                    ...questionnaire,
                                    ...{ open: false }
                                });
                                this.props.disableScheduledJobsDispatch(questionnaireId, survey);
                            }
                        }
                    ]}
                />
                <IonAlert
                    isOpen={showArchiveAlert}
                    onDidDismiss={() => {
                        this.setState({ showArchiveAlert: false });
                    }}
                    header={'Archive Questionnaire'}
                    message={`Are you sure you want to archive this questionnaire? The questionnaire's data will not be deleted, but you will no longer be able to access it.`}
                    buttons={[
                        {
                            text: 'Cancel',
                            role: 'cancel',
                            cssClass: 'secondary'
                        },
                        {
                            text: 'Yes',
                            handler: () => {
                                questionnaire.archived = true;
                                questionnaire.open = false;
                                this.props.updateQuestionnaireDispatch(questionnaireId, questionnaire);
                                this.props.disableScheduledJobsDispatch(questionnaireId, survey);
                                this.props.removeQuestionnaireDispatch(questionnaireId);
                                this.props.history.push(`${routes.SURVEY}/${questionnaire.surveyId}`);
                            }
                        }
                    ]}
                />
                <IonAlert
                    isOpen={showDeleteAlert}
                    onDidDismiss={() => {
                        this.setState({ showDeleteAlert: false });
                    }}
                    header={'Delete Questionnaire'}
                    message={`Are you sure you want to delete this questionnaire? The questionnaire's data cannot be recovered.`}
                    buttons={[
                        {
                            text: 'Cancel',
                            role: 'cancel',
                            cssClass: 'secondary'
                        },
                        {
                            text: 'Yes',
                            handler: () => {
                                deleteQuestionnaire(questionnaire.id)
                                    .then((res: any) => {
                                        this.props.disableScheduledJobsDispatch(questionnaireId, survey);
                                        this.props.removeQuestionnaireDispatch(questionnaireId);
                                        this.props.history.push(`/survey/${questionnaire.surveyId}`);
                                    })
                                    .catch((err) => {
                                        console.error(err);
                                    });
                            }
                        }
                    ]}
                />
            </IonPage>
        );
    }
}

function a11yProps(index: any) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`
    };
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <Typography
            component='div'
            role='tabpanel'
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}>
            {value === index && <Box p={3}>{children}</Box>}
        </Typography>
    );
}

function mapStateToProps(state: any) {
    return {
        isLoading: state.loading,
        survey: state.survey,
        questionnaire: state.questionnaire,
        firebase: state.firebase,
        loggedIn: state.authentication.loggedIn
    };
}

function mapDispatchToProps(dispatch: any) {
    return {
        updateQuestionnaireDispatch(questionnaireId: string, questionnaire: any) {
            dispatch(updateQuestionnaire(questionnaireId, questionnaire));
        },
        removeQuestionnaireDispatch(questionnaireId: string) {
            dispatch(removeQuestionnaire(questionnaireId));
        },
        disableScheduledJobsDispatch(questionnaireId: string, survey: any) {
            dispatch(disableScheduledJobs(questionnaireId, survey));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Q13Editor);
