import { IonCol, IonGrid, IonIcon, IonItem, IonRow, IonText } from '@ionic/react';
import { Accordion, AccordionActions, AccordionDetails, AccordionSummary } from '@material-ui/core';
import { chevronDown } from 'ionicons/icons';
import { Component } from 'react';
import { ScheduledJob, Questionnaire, Survey } from '../interfaces/DataTypes';
import { NewJobButtons } from './Components';
import JobDetails from './JobDetails';
import './ScheduledJobs.css';

interface Props {
    newJob: ScheduledJob;
    survey: Survey;
    questionnaireList: Questionnaire[];
    setNewJobValue: Function;
    setNewJobType: Function;
    saveNewJob: Function;
    deleteJob: Function;
    displayEventType: Function;
}

interface State {}

class NewJobAccordion extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {};
    }

    render() {
        const {
            newJob,
            saveNewJob,
            deleteJob,
            questionnaireList,
            setNewJobValue,
            setNewJobType,
            displayEventType,
            survey
        } = this.props;

        return (
            <Accordion expanded>
                <AccordionSummary
                    expandIcon={<IonIcon icon={chevronDown} />}
                    style={{ backgroundColor: '#f4f5f8', paddingRight: '26px' }}
                    className='job-summary'>
                    <IonGrid>
                        <IonRow>
                            <IonCol size='6.5'>
                                <IonItem lines='none' color='light' class='summary-text'>
                                    <strong>name:</strong>
                                    {newJob.name ? newJob.name : 'New Job'}
                                </IonItem>
                            </IonCol>
                            <IonCol size='3'>
                                <IonItem lines='none' color='light' class='summary-text'>
                                    <strong>type:</strong>
                                    {newJob.type ? displayEventType(newJob) : ''}
                                </IonItem>
                            </IonCol>
                            <IonCol>
                                <IonItem lines='none' color='light' class='summary-text'>
                                    <strong>status:</strong>
                                    <IonText color='success'>new</IonText>
                                </IonItem>
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                </AccordionSummary>
                <AccordionDetails>
                    <JobDetails
                        job={newJob}
                        survey={survey}
                        editing={true}
                        questionnaireList={questionnaireList}
                        setValue={setNewJobValue}
                        setType={setNewJobType}
                    />
                </AccordionDetails>
                <AccordionActions>
                    <NewJobButtons newJob={newJob} saveNewJob={saveNewJob} deleteJob={deleteJob} />
                </AccordionActions>
            </Accordion>
        );
    }
}

export default NewJobAccordion;
