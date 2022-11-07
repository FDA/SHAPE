import React from 'react';
import {
    IonAlert,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonContent,
    IonHeader,
    IonIcon,
    IonModal,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import { Survey, Questionnaire, ScheduledJob, JobError } from '../interfaces/DataTypes';
import { add } from 'ionicons/icons';
import { cloneDeep } from 'lodash';
import { guid } from '../utils/Utils';
import { RouteComponentProps, withRouter } from 'react-router';
import { jobTypes } from '../utils/Constants';
import JobAccordion from './JobAccordion';
import NewJobAccordion from './NewJobAccordion';
import './ScheduledJobs.css';

interface PassedProps extends RouteComponentProps {
    survey: Survey;
    questionnaireList: Questionnaire[];
    updateSurveyDispatch: Function;
}

interface State {
    showModal: boolean;
    newJob: ScheduledJob;
    editJob: ScheduledJob;
    deleteJob: string;
    error: JobError;
}

class ScheduledJobs extends React.Component<PassedProps, State> {
    constructor(props: PassedProps) {
        super(props);
        this.state = {
            showModal: false,
            newJob: null,
            editJob: null,
            deleteJob: null,
            error: null
        };
    }

    isEmpty = (obj: any) => {
        if (obj === null || obj === '' || obj === undefined) return true;
        return false;
    };

    resetState = () => {
        this.setState({
            showModal: false,
            newJob: null,
            editJob: null,
            error: null
        });
    };

    componentDidUpdate(prevProps: Readonly<PassedProps>) {
        if (prevProps.location !== this.props.location) this.resetState();
    }

    toggleModal = (bool: boolean) => {
        const { newJob, editJob } = this.state;
        if (!bool && (newJob || editJob)) {
            return this.throwError({
                name: 'Unsaved changes',
                message: 'Please save all new and edited jobs before exiting.'
            });
        }
        this.setState({ showModal: bool });
    };

    throwError = (error: Error) => {
        this.setState({
            error: {
                name: error.name,
                message: error.message
            }
        });
    };

    saveNewJob = () => {
        const { newJob } = this.state;
        const survey = cloneDeep(this.props.survey);
        if (!survey.scheduledJobs) survey.scheduledJobs = [];
        this.cleanJob(newJob);

        if (this.validateJob(newJob)) {
            newJob.enabled = true;
            newJob.surveyId = survey.id;
            survey.scheduledJobs.push(newJob);
            this.props.updateSurveyDispatch(survey.id, survey);
            setTimeout(() => this.setState({ newJob: null }), 500);
        }
    };

    saveEditJob = () => {
        const { editJob } = this.state;
        const survey = cloneDeep(this.props.survey);
        this.cleanJob(editJob);

        if (this.validateJob(editJob)) {
            editJob.surveyId = survey.id;
            if (this.q13ToJoinIsClosed(editJob)) editJob.enabled = false;
            survey.scheduledJobs = survey.scheduledJobs.map((job: ScheduledJob) => {
                if (job.id === editJob.id) return editJob;
                return job;
            });
            this.props.updateSurveyDispatch(survey.id, survey);
            setTimeout(() => this.setState({ editJob: null }), 500);
        }
    };

    setEnabled = (job: ScheduledJob, bool: boolean) => {
        const JobId = job.id;
        const survey = cloneDeep(this.props.survey);
        if (job.enabled !== bool) {
            if (bool && this.q13ToJoinIsClosed(job)) {
                return this.throwError({
                    name: 'Cannot Enable Job',
                    message: 'Questionnaire to Join is closed.'
                });
            }
            survey.scheduledJobs.forEach((scheduledJob: ScheduledJob) => {
                if (scheduledJob.id === JobId) scheduledJob.enabled = bool;
            });
            this.props.updateSurveyDispatch(survey.id, survey);
        }
    };

    q13ToJoinIsClosed = (job: ScheduledJob) => {
        const questionnaireList = cloneDeep(this.props.questionnaireList);
        return questionnaireList
            .filter((q: Questionnaire) => q.id === job.questionnaireToJoin)
            .map((q: Questionnaire) => {
                if (q.locked && !q.open) return true;
                return false;
            })[0];
    };

    cleanJob = (job: ScheduledJob) => {
        const {
            onSurveyJoined,
            onQuestionnaireCompleted,
            onDiaryNotWritten,
            onQuestionnaireNotCompleted
        } = jobTypes;

        if (job.type === onSurveyJoined.value) {
            delete job.questionnaireCompleted;
            delete job.questionnaireNotCompleted;
            delete job.message;
            delete job.frequency;
        }
        if (job.type === onQuestionnaireCompleted.value) {
            delete job.questionnaireNotCompleted;
            delete job.message;
            delete job.frequency;
        }
        if (job.type === onDiaryNotWritten.value) {
            delete job.questionnaireToJoin;
            delete job.questionnaireCompleted;
            delete job.questionnaireNotCompleted;
            delete job.duration;
        }
        if (job.type === onQuestionnaireNotCompleted.value) {
            delete job.questionnaireToJoin;
            delete job.questionnaireCompleted;
            delete job.duration;
        }
    };

    validateJob = (job: ScheduledJob) => {
        const errors = [];
        if (!job.type) errors.push(' Event Type');
        if (!job.name) errors.push(' Job Name');
        if (job.type === jobTypes.onSurveyJoined.value) {
            if (!job.questionnaireToJoin) errors.push(' Questionnaire to Join');
            if (this.isEmpty(job.interval)) errors.push(' Join after (days)');
            if (this.isEmpty(job.duration)) errors.push(' Available for (days)');
        }
        if (job.type === jobTypes.onQuestionnaireCompleted.value) {
            if (!job.questionnaireCompleted) errors.push(' Baseline Questionnaire');
            if (!job.questionnaireToJoin) errors.push(' Questionnaire to Join');
            if (this.isEmpty(job.interval)) errors.push(' Join after (days)');
            if (this.isEmpty(job.duration)) errors.push(' Available for (days)');
        }
        if (job.type === jobTypes.onDiaryNotWritten.value) {
            if (this.isEmpty(job.interval)) errors.push(' Notify After (days)');
            if (this.isEmpty(job.frequency)) errors.push(' Notify Every (days)');
            if (!job.message) errors.push(' Notification message');
        }
        if (job.type === jobTypes.onQuestionnaireNotCompleted.value) {
            if (!job.questionnaireNotCompleted) errors.push(' Questionnaire');
            if (this.isEmpty(job.interval)) errors.push(' Notify After (days)');
            if (this.isEmpty(job.frequency)) errors.push(' Notify Every (days)');
            if (!job.message) errors.push(' Notification message');
        }
        if (errors.length) {
            this.throwError({ name: 'Missing Required Fields', message: errors.toString() });
            return false;
        }

        if (
            job.questionnaireCompleted &&
            job.questionnaireToJoin &&
            job.questionnaireCompleted === job.questionnaireToJoin
        ) {
            this.throwError({
                name: 'Cannot Save Job',
                message: 'Questionnaire Completed and Questionnaire to Join cannot be the same.'
            });
            return false;
        }
        return true;
    };

    setNewJobValue = (name: string, value: any) => {
        const { newJob } = this.state;
        if (newJob) {
            this.setState({ newJob: { ...newJob, [name]: value } });
        }
    };

    setEditJobValue = (name: string, value: any) => {
        const { editJob } = this.state;
        if (editJob) {
            this.setState({ editJob: { ...editJob, [name]: value } });
        }
    };

    setNewJobType = (value: string) => {
        const { newJob } = this.state;
        const defaultMessage = this.getDefaultMessage(value, newJob);

        if (newJob && newJob.type !== value) {
            if (value === jobTypes.onDiaryNotWritten.value) {
                return this.setState({
                    newJob: { ...newJob, type: value, message: defaultMessage }
                });
            } else if (value === jobTypes.onQuestionnaireNotCompleted.value) {
                return this.setState({ newJob: { ...newJob, type: value, message: defaultMessage } });
            } else {
                return this.setState({ newJob: { ...newJob, type: value } });
            }
        }
    };

    setEditJobType = (value: string) => {
        const { editJob } = this.state;
        const defaultMessage = this.getDefaultMessage(value, editJob);

        if (editJob && editJob.type !== value) {
            if (value === jobTypes.onDiaryNotWritten.value) {
                return this.setState({
                    editJob: { ...editJob, type: value, message: defaultMessage }
                });
            } else if (value === jobTypes.onQuestionnaireNotCompleted.value) {
                return this.setState({ editJob: { ...editJob, type: value, message: defaultMessage } });
            } else {
                return this.setState({ editJob: { ...editJob, type: value } });
            }
        }
    };

    getDefaultMessage = (type: string, job: ScheduledJob) => {
        const { survey } = this.props;

        if (type === jobTypes.onDiaryNotWritten.value) {
            return `A self-report has not been created recently for survey ${survey.name}. Consistently submitting self-reports helps improve the accuracy of the study. Please consider creating one at your earliest convenience.`;
        } else if (type === jobTypes.onQuestionnaireNotCompleted.value) {
            return `Reminder! Please complete questionnaires for survey ${survey.name} at your earliest convenience. Thank you!`;
        }
    };

    addNewJob = () => {
        const { survey } = this.props;

        const newJob: ScheduledJob = {
            id: guid(),
            type: '',
            enabled: false,
            surveyId: survey.id,
            interval: null
        };
        this.setState({ newJob: newJob });
    };

    setEditJob = (jobId: string) => {
        const { scheduledJobs } = this.props.survey;
        const editJob = scheduledJobs.find((job: ScheduledJob) => job.id === jobId);
        this.setState({ editJob: editJob });
    };

    cancelEditJob = () => {
        const { editJob } = this.state;
        if (editJob) {
            this.setState({ editJob: null });
        }
    };

    deleteJobAlert = (jobId: string) => {
        this.setState({ deleteJob: jobId });
    };

    deleteJob = () => {
        const survey = cloneDeep(this.props.survey);
        const { newJob, editJob, deleteJob } = this.state;
        if (newJob && newJob.id === deleteJob) return this.setState({ newJob: null });
        if (editJob && editJob.id === deleteJob) this.setState({ editJob: null });
        survey.scheduledJobs = survey.scheduledJobs.filter((job: ScheduledJob) => job.id !== deleteJob);
        this.props.updateSurveyDispatch(survey.id, survey);
    };

    displayEventType = (job: ScheduledJob) => {
        const {
            onDiaryNotWritten,
            onSurveyJoined,
            onQuestionnaireCompleted,
            onQuestionnaireNotCompleted
        } = jobTypes;
        switch (job.type) {
            case onSurveyJoined.value:
                return onSurveyJoined.title;
            case onQuestionnaireCompleted.value:
                return onQuestionnaireCompleted.title;
            case onDiaryNotWritten.value:
                return onDiaryNotWritten.title;
            case onQuestionnaireNotCompleted.value:
                return onQuestionnaireNotCompleted.title;
            default:
                return job.type;
        }
    };

    render() {
        const { showModal, newJob, editJob, error, deleteJob } = this.state;
        const { survey, questionnaireList } = this.props;
        const { scheduledJobs } = survey;
        const noJobs = scheduledJobs ? !scheduledJobs.length && !newJob : !newJob;

        return (
            <>
                <IonButton color='dark' onClick={() => this.toggleModal(true)}>
                    <b>Schedule</b>
                </IonButton>

                <IonModal
                    isOpen={showModal}
                    backdropDismiss={false}
                    onIonModalWillDismiss={() => this.toggleModal(false)}
                    class='scheduler'>
                    <IonHeader>
                        <IonToolbar>
                            <IonTitle>Scheduled Jobs:&nbsp;&nbsp;{survey.name}</IonTitle>
                            <IonButtons slot='end' class='ion-padding'>
                                <IonButton
                                    hidden={noJobs}
                                    onClick={this.addNewJob}
                                    disabled={newJob ? true : false}>
                                    <IonIcon icon={add} />
                                    &nbsp;New Job
                                </IonButton>
                                <IonButton color='danger' onClick={() => this.toggleModal(false)}>
                                    Close
                                </IonButton>
                            </IonButtons>
                        </IonToolbar>
                    </IonHeader>
                    <IonContent>
                        {newJob && (
                            <NewJobAccordion
                                newJob={newJob}
                                survey={survey}
                                questionnaireList={questionnaireList}
                                setNewJobValue={this.setNewJobValue}
                                setNewJobType={this.setNewJobType}
                                saveNewJob={this.saveNewJob}
                                deleteJob={this.deleteJobAlert}
                                displayEventType={this.displayEventType}
                            />
                        )}
                        {scheduledJobs &&
                            scheduledJobs.map((job: ScheduledJob) => {
                                const editing = editJob && editJob.id === job.id;
                                const disabled = editJob && editJob.id !== job.id;
                                return (
                                    <JobAccordion
                                        key={job.id}
                                        job={editing ? editJob : job}
                                        editing={editing}
                                        disabled={disabled}
                                        survey={survey}
                                        questionnaireList={questionnaireList}
                                        setEditJobValue={this.setEditJobValue}
                                        setEditJobType={this.setEditJobType}
                                        setEditJob={this.setEditJob}
                                        saveEditJob={this.saveEditJob}
                                        cancelEditJob={this.cancelEditJob}
                                        deleteJob={this.deleteJobAlert}
                                        setEnabled={this.setEnabled}
                                        displayEventType={this.displayEventType}
                                    />
                                );
                            })}
                        {noJobs && (
                            <IonCard className='no-jobs-card'>
                                <IonCardHeader>No Jobs yet, click the button to add one</IonCardHeader>
                                <IonCardContent>
                                    <IonButton onClick={() => this.addNewJob()}>
                                        <IonIcon icon={add} />
                                        &nbsp;New Job
                                    </IonButton>
                                </IonCardContent>
                            </IonCard>
                        )}
                        <IonAlert
                            isOpen={error ? true : false}
                            onDidDismiss={() => this.setState({ error: null })}
                            header={error ? error.name : ''}
                            message={error ? error.message : ''}
                            buttons={['OK']}
                        />
                        <IonAlert
                            isOpen={deleteJob ? true : false}
                            onDidDismiss={() => this.setState({ deleteJob: null })}
                            header='Delete Job'
                            message='Are you sure you want to delete this job?'
                            buttons={[
                                {
                                    text: 'Cancel',
                                    handler: () => {
                                        this.setState({ deleteJob: null });
                                    }
                                },
                                {
                                    text: 'Delete',
                                    handler: () => {
                                        this.deleteJob();
                                    }
                                }
                            ]}
                        />
                    </IonContent>
                </IonModal>
            </>
        );
    }
}

export default withRouter(ScheduledJobs);
