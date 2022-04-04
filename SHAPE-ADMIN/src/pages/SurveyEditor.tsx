import React from 'react';
import AppHeader from '../layout/AppHeader';
import {
    IonFabButton,
    IonGrid,
    IonIcon,
    IonInput,
    IonItem,
    IonFab,
    IonLabel,
    IonPage,
    IonRow,
    IonText,
    IonTextarea,
    IonCol,
    IonContent,
    IonButtons,
    IonButton,
    IonAlert
} from '@ionic/react';
import {Redirect} from 'react-router-dom';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import {add, arrowBackOutline} from 'ionicons/icons';
import {AppBar} from '@material-ui/core';
import {TabPanelProps} from '../interfaces/Components';
import ParticipantList from '../list/ParticipantList';
import ProfileList from '../list/ProfileList';
import QuestionnaireList from '../list/QuestionnaireList';
import ParticipantImport from './ParticipantImport';
import {isEmptyObject} from '../utils/Utils';
import {storeSurvey, updateSurvey, removeSurvey} from '../redux/actions/Survey';
import {connect} from 'react-redux';
import {Survey} from '../interfaces/DataTypes';
import DiaryTypeList from '../list/DiaryTypeList';
import {
    getQuestionnaires,
    getOpenQuestionnaires,
    deleteSurvey
} from '../utils/API';
import {ParticipantProgressPanel} from '../progressCharting';
import LoadingScreen from '../layout/LoadingScreen';
import {EditSaveCancelButton} from './components';
import {RouteComponentProps} from 'react-router';
import {routes} from '../utils/Constants';
import {cloneDeep} from 'lodash';

interface StateProps {
    editing: boolean;
    value: number;
    failure: boolean;
    isLoading: boolean;
    redirect: boolean;
    showArchiveAlert: boolean;
    showCloseAlert: boolean;
    showOpenAlert: boolean;
    showAlert: boolean;
    showDeleteAlert: boolean;
    alertMessage: string;
    name: string;
    shortDescription: string;
    description: string;
    informedConsent: string;
}

interface ReduxProps extends RouteComponentProps {
    survey: Survey;
    loggedIn: boolean;
    storeSurveyDispatch: Function;
    updateSurveyDispatch: Function;
    removeSurveyDispatch: Function;
}

class SurveyEditor extends React.Component<ReduxProps, StateProps> {
    constructor(props: ReduxProps) {
        super(props);
        this.state = {
            editing: false,
            value: 0,
            failure: false,
            isLoading: false,
            redirect: false,
            showArchiveAlert: false,
            showOpenAlert: false,
            showCloseAlert: false,
            showAlert: false,
            showDeleteAlert: false,
            alertMessage: '',
            name: '',
            shortDescription: '',
            description: '',
            informedConsent: ''
        };
    }

    UNSAFE_componentWillMount() {
        const {loggedIn} = this.props;
        if (!loggedIn) {
            this.props.history.push(routes.LOGIN);
        }
    }

    UNSAFE_componentWillReceiveProps(props: ReduxProps) {
        let {editing} = this.state;
        let survey = cloneDeep(props.survey);
        if (!editing) {
            this.setState({
                name: survey.name,
                shortDescription: survey.shortDescription,
                description: survey.description,
                informedConsent: survey.informedConsent
            });
        }
    }

    setShowAlert(bool: boolean, message: string = '') {
        this.setState({showAlert: bool, alertMessage: message});
    }

    handleChange = (e: any, val: number) => {
        this.setState({value: val});
    };

    handleClick = () => {
        let {survey} = this.props;
        if (this.state.value === 0) {
            this.props.history.push({
                pathname: routes.NEW_QUESTIONNAIRE,
                state: {surveyId: survey.id}
            });
        } else {
            this.props.history.push({
                pathname: routes.NEW_PARTICIPANT,
                state: {surveyId: survey.id}
            });
        }
    };

    edit = () => {
        this.setState({editing: true});
    };

    save = () => {
        let {survey} = this.props;
        let {name, shortDescription, description, informedConsent} = this.state;
        if (isEmptyObject(name)) name = survey.name;
        if (isEmptyObject(shortDescription))
            shortDescription = survey.shortDescription;
        if (isEmptyObject(description)) description = survey.description;
        if (isEmptyObject(informedConsent))
            informedConsent = survey.informedConsent;

        if (
            !isEmptyObject(name) &&
            !isEmptyObject(shortDescription) &&
            !isEmptyObject(description) &&
            !isEmptyObject(informedConsent)
        ) {
            let tempSurvey: Survey = {
                name: name,
                shortDescription: shortDescription,
                description: description,
                informedConsent: informedConsent,
                archived: survey.archived,
                open: survey.open,
                dateCreated: survey.dateCreated
            };
            this.props.updateSurveyDispatch(survey.id, tempSurvey);
        } else {
            this.setState({failure: true});
        }
        this.setState({editing: false});
    };

    cancel = () => {
        let {survey} = this.props;
        this.setState({
            editing: false,
            name: survey.name,
            shortDescription: survey.shortDescription,
            description: survey.description,
            informedConsent: survey.informedConsent
        });
    };

    archive = () => {
        this.setState({showArchiveAlert: true});
    };

    open = () => {
        let {survey} = this.props;
        getQuestionnaires(survey.id)
            .then((snapshot: any) => {
                if (snapshot.size === 0) {
                    this.setState({
                        showAlert: true,
                        alertMessage:
                            'Create a questionnaire before opening the survey.'
                    });
                } else {
                    this.setState({showOpenAlert: true});
                }
            })
            .catch(() => {
                this.setState({
                    showAlert: true,
                    alertMessage:
                        'Something went wrong. Please refresh and try again.'
                });
            });
    };

    close = () => {
        let {survey} = this.props;
        getOpenQuestionnaires(survey.id)
            .then((snapshot: any) => {
                if (snapshot.size > 0) {
                    this.setState({
                        showAlert: true,
                        alertMessage:
                            'A survey cannot be closed while a questionnaire is open.'
                    });
                } else {
                    this.setState({showCloseAlert: true});
                }
            })
            .catch(() => {
                this.setState({
                    showAlert: true,
                    alertMessage:
                        'Something went wrong. Please refresh and try again.'
                });
            });
    };

    delete = () => {
        this.setState({showDeleteAlert: true});
    };

    getOpenText = (open: boolean, locked: boolean) => {
        if (open) return 'Open';
        else if (locked) return 'Closed';
        else return 'Draft';
    };

    render() {
        let {survey} = this.props;
        let surveyId = survey.id;
        let {
            value,
            isLoading,
            redirect,
            showArchiveAlert,
            showOpenAlert,
            showCloseAlert,
            showDeleteAlert,
            showAlert,
            alertMessage,
            editing,
            name,
            shortDescription,
            description,
            informedConsent
        } = this.state;

        return (
            <>
                {redirect && <Redirect to={routes.HOME} />}
                {!redirect && (
                    <IonPage>
                        {isLoading && <LoadingScreen />}
                        <AppHeader />
                        <IonContent className="ion-padding">
                            <IonRow>
                                <IonCol>
                                    <span style={{float: 'left'}}>
                                        <IonFabButton
                                            style={{'--box-shadow': 'none'}}
                                            color="light"
                                            size="small"
                                            href={routes.HOME}>
                                            <IonIcon
                                                icon={
                                                    arrowBackOutline
                                                }></IonIcon>
                                        </IonFabButton>
                                    </span>
                                </IonCol>
                                <IonCol>
                                    <IonText color="primary">
                                        <span style={{float: 'right'}}>
                                            <IonButtons slot="end">
                                                <IonButton
                                                    disabled={
                                                        (!isEmptyObject(
                                                            survey.locked
                                                        )
                                                            ? survey.locked
                                                            : false) || editing
                                                    }
                                                    color="primary"
                                                    onClick={() => this.open()}>
                                                    Open
                                                </IonButton>
                                                <IonButton
                                                    disabled={!survey.open}
                                                    color="secondary"
                                                    onClick={() =>
                                                        this.close()
                                                    }>
                                                    Close
                                                </IonButton>
                                                <EditSaveCancelButton
                                                    edit={this.edit}
                                                    save={this.save}
                                                    cancel={this.cancel}
                                                    editing={editing}
                                                    locked={survey.locked}
                                                />
                                                {survey.locked && (
                                                    <IonButton
                                                        color="danger"
                                                        disabled={survey.open}
                                                        onClick={() =>
                                                            this.archive()
                                                        }>
                                                        Archive
                                                    </IonButton>
                                                )}
                                                {!survey.locked && (
                                                    <IonButton
                                                        color="danger"
                                                        onClick={() =>
                                                            this.delete()
                                                        }>
                                                        Delete
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
                                        <IonLabel color="primary">
                                            Survey Name
                                        </IonLabel>
                                        <IonInput
                                            id="survey-name"
                                            placeholder="Enter Input"
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
                                        <IonLabel color="primary">
                                            Subtitle
                                        </IonLabel>
                                        <IonInput
                                            id="survey-subtitle"
                                            placeholder="Survey Subtitle"
                                            value={shortDescription}
                                            readonly={!editing}
                                            onIonInput={(e: any) => {
                                                this.setState({
                                                    shortDescription:
                                                        e.target.value
                                                });
                                            }}
                                        />
                                    </IonItem>
                                </IonCol>
                                <IonCol>
                                    <IonItem>
                                        <IonLabel color="primary">
                                            Status
                                        </IonLabel>
                                        <IonInput
                                            id="survey-status"
                                            placeholder="Survey Status"
                                            value={this.getOpenText(
                                                survey.open,
                                                survey.locked
                                            )}
                                            readonly={true}
                                        />
                                    </IonItem>
                                </IonCol>
                            </IonRow>
                            <IonRow>
                                <IonCol>
                                    <IonItem>
                                        <IonLabel color="primary">
                                            Description
                                        </IonLabel>
                                        <IonTextarea
                                            id="survey-description"
                                            rows={2}
                                            placeholder="Survey Description"
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
                            <IonRow>
                                <IonCol>
                                    <IonItem>
                                        <IonLabel
                                            position="stacked"
                                            color="primary"
                                            style={{fontSize: '22px'}}>
                                            Informed Consent
                                        </IonLabel>
                                        <IonTextarea
                                            id="informed-consent"
                                            readonly={!editing}
                                            rows={6}
                                            placeholder="Informed Consent goes here..."
                                            value={informedConsent}
                                            onIonChange={(e: any) => {
                                                this.setState({
                                                    informedConsent:
                                                        e.target.value
                                                });
                                            }}
                                        />
                                    </IonItem>
                                </IonCol>
                            </IonRow>
                            <AppBar
                                style={{backgroundColor: '#007CBA'}}
                                position="static">
                                <Tabs
                                    value={value}
                                    onChange={this.handleChange}
                                    aria-label="survey-tabs">
                                    <Tab
                                        label="Questionnaires"
                                        {...a11yProps(0)}
                                    />
                                    <Tab
                                        label="Health Events"
                                        {...a11yProps(1)}
                                    />
                                    <Tab
                                        label="Respondents"
                                        {...a11yProps(2)}
                                    />
                                    <Tab
                                        label="Participants"
                                        {...a11yProps(3)}
                                    />
                                    <Tab label="Progress" {...a11yProps(4)} />
                                </Tabs>
                            </AppBar>
                            <TabPanel value={value} index={0}>
                                <IonGrid>
                                    <QuestionnaireList surveyId={surveyId} />
                                </IonGrid>
                            </TabPanel>
                            <TabPanel value={value} index={1}>
                                <DiaryTypeList />
                            </TabPanel>
                            <TabPanel value={value} index={2}>
                                <IonRow>
                                    <IonCol size="12">
                                        <ParticipantImport />
                                    </IonCol>
                                </IonRow>
                                <IonRow>
                                    <IonCol size="12">
                                        <ParticipantList />
                                    </IonCol>
                                </IonRow>
                            </TabPanel>
                            <TabPanel value={value} index={3}>
                                <ProfileList />
                            </TabPanel>
                            <TabPanel value={value} index={4}>
                                <ParticipantProgressPanel view="survey" />
                            </TabPanel>

                            {value !== 3 && value !== 1 && value !== 4 && (
                                <IonFab
                                    vertical="bottom"
                                    horizontal="end"
                                    slot="fixed">
                                    <IonFabButton
                                        disabled={
                                            !survey.open &&
                                            (!isEmptyObject(survey.locked)
                                                ? survey.locked
                                                : false)
                                        }
                                        onClick={() => this.handleClick()}>
                                        <IonIcon icon={add} />
                                    </IonFabButton>
                                </IonFab>
                            )}
                        </IonContent>
                    </IonPage>
                )}
                <IonAlert
                    isOpen={showDeleteAlert}
                    onDidDismiss={() => {
                        this.setState({showDeleteAlert: false});
                    }}
                    header={'Delete Survey'}
                    message={`Are you sure you want to delete this survey? The survey's data cannot be recovered.`}
                    buttons={[
                        {
                            text: 'Cancel',
                            role: 'cancel',
                            cssClass: 'secondary'
                        },
                        {
                            text: 'Yes',
                            handler: () => {
                                deleteSurvey(survey.id)
                                    .then((res: any) => {
                                        let parent = this;
                                        this.setState({isLoading: true});
                                        this.props.removeSurveyDispatch(
                                            survey.id
                                        );
                                        setTimeout(function () {
                                            parent.setState({
                                                isLoading: false,
                                                redirect: true
                                            });
                                            parent.props.history.push(
                                                routes.HOME
                                            );
                                        }, 1000);
                                    })
                                    .catch((err) => {
                                        console.error(err);
                                    });
                            }
                        }
                    ]}
                />
                <IonAlert
                    isOpen={showArchiveAlert}
                    onDidDismiss={() => {
                        this.setState({showArchiveAlert: false});
                    }}
                    header={'Archive Survey'}
                    message={`Are you sure you want to archive this survey? The survey's data will not be deleted, but you will no longer be able to access it.`}
                    buttons={[
                        {
                            text: 'Cancel',
                            role: 'cancel',
                            cssClass: 'secondary'
                        },
                        {
                            text: 'Yes',
                            handler: () => {
                                let parent = this;
                                this.setState({isLoading: true});
                                this.props.updateSurveyDispatch(surveyId, {
                                    ...survey,
                                    ...{archived: true, open: false}
                                });
                                this.props.removeSurveyDispatch(surveyId);
                                setTimeout(function () {
                                    parent.setState({
                                        isLoading: false,
                                        redirect: true
                                    });
                                    parent.props.history.push(routes.HOME);
                                }, 1000);
                            }
                        }
                    ]}
                />
                <IonAlert
                    isOpen={showOpenAlert}
                    onDidDismiss={() => {
                        this.setState({showOpenAlert: false});
                    }}
                    header={'Open Survey'}
                    message={`Are you sure you want to open this survey? You will no longer be able to edit the survey details. This action cannot be undone.`}
                    buttons={[
                        {
                            text: 'Cancel',
                            role: 'cancel',
                            cssClass: 'secondary'
                        },
                        {
                            text: 'Yes',
                            handler: () => {
                                this.props.updateSurveyDispatch(surveyId, {
                                    ...survey,
                                    ...{open: true, locked: true}
                                });
                            }
                        }
                    ]}
                />
                <IonAlert
                    isOpen={showCloseAlert}
                    onDidDismiss={() => {
                        this.setState({showCloseAlert: false});
                    }}
                    header={'Close Survey'}
                    message={`Are you sure you want to close this survey? Users will no longer have access to any questionnaires in this survey. You will no longer make any edits to any questionnaires or participants. This action cannot be undone.`}
                    buttons={[
                        {
                            text: 'Cancel',
                            role: 'cancel',
                            cssClass: 'secondary'
                        },
                        {
                            text: 'Yes',
                            handler: () => {
                                this.props.updateSurveyDispatch(surveyId, {
                                    ...survey,
                                    ...{open: false}
                                });
                            }
                        }
                    ]}
                />
                <IonAlert
                    isOpen={showAlert}
                    onDidDismiss={() => {
                        this.setShowAlert(false);
                    }}
                    header={'Error'}
                    message={alertMessage}
                    buttons={['OK']}
                />
            </>
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
    const {children, value, index, ...other} = props;

    return (
        <Typography
            component="div"
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}>
            {value === index && <Box p={3}>{children}</Box>}
        </Typography>
    );
}

// Map Redux state to component props
function mapStateToProps(state: any) {
    return {
        survey: state.survey,
        loggedIn: state.authentication.loggedIn
    };
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch: any) {
    return {
        storeSurveyDispatch(surveyId: string) {
            dispatch(storeSurvey(surveyId));
        },
        updateSurveyDispatch(surveyId: string, survey: any) {
            dispatch(updateSurvey(surveyId, survey));
        },
        removeSurveyDispatch(surveyId: string) {
            dispatch(removeSurvey(surveyId));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SurveyEditor);
