import { IonCol, IonGrid, IonIcon, IonItem, IonRow, IonText } from '@ionic/react';
import { Accordion, AccordionActions, AccordionDetails, AccordionSummary } from '@material-ui/core';
import { chevronDown } from 'ionicons/icons';
import { Component } from 'react';
import { Questionnaire, ScheduledJob, Survey } from '../interfaces/DataTypes';
import { JobButtons } from './Components';
import JobDetails from './JobDetails';
import './ScheduledJobs.css';

interface Props {
    job: ScheduledJob;
    survey: Survey;
    editing: boolean;
    disabled: boolean;
    questionnaireList: Questionnaire[];
    setEditJobValue: Function;
    setEditJobType: Function;
    setEditJob: Function;
    saveEditJob: Function;
    cancelEditJob: Function;
    deleteJob: Function;
    setEnabled: Function;
    displayEventType: Function;
}

interface State {}

class JobAccordion extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {};
    }

    render() {
        const {
            job,
            survey,
            editing,
            disabled,
            questionnaireList,
            deleteJob,
            setEditJob,
            saveEditJob,
            cancelEditJob,
            setEditJobValue,
            setEditJobType,
            displayEventType,
            setEnabled
        } = this.props;

        return (
            <Accordion key={job.id}>
                <AccordionSummary
                    expandIcon={<IonIcon icon={chevronDown} />}
                    style={{ backgroundColor: '#f4f5f8', paddingRight: '26px' }}
                    className='job-summary'>
                    <IonGrid>
                        <IonRow>
                            <IonCol size='6.5'>
                                <IonItem lines='none' color='light' class='summary-text'>
                                    <strong>name:</strong>
                                    {job.name}
                                </IonItem>
                            </IonCol>
                            <IonCol size='3.5'>
                                <IonItem lines='none' color='light' class='summary-text'>
                                    <strong>type:</strong>
                                    {displayEventType(job)}
                                </IonItem>
                            </IonCol>
                            <IonCol size='2'>
                                {editing ? (
                                    <IonItem lines='none' color='light' class='summary-text'>
                                        <IonText>
                                            <strong>status:</strong>
                                            <IonText color='danger'>&nbsp;&nbsp;editing</IonText>
                                        </IonText>
                                    </IonItem>
                                ) : (
                                    <IonItem lines='none' color='light' class='summary-text'>
                                        <strong>status:</strong>
                                        <IonText color={job.enabled ? 'success' : 'danger'}>
                                            {job.enabled ? 'ON' : 'OFF'}
                                        </IonText>
                                    </IonItem>
                                )}
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                </AccordionSummary>
                <AccordionDetails>
                    <JobDetails
                        job={job}
                        survey={survey}
                        editing={editing}
                        questionnaireList={questionnaireList}
                        setValue={setEditJobValue}
                        setType={setEditJobType}
                    />
                </AccordionDetails>
                <AccordionActions>
                    <JobButtons
                        disabled={disabled}
                        editing={editing}
                        job={job}
                        setEditJob={setEditJob}
                        saveEditJob={saveEditJob}
                        cancelEditJob={cancelEditJob}
                        deleteJob={deleteJob}
                        setEnabled={setEnabled}
                    />
                </AccordionActions>
            </Accordion>
        );
    }
}

export default JobAccordion;
