import { IonGrid, IonItem, IonRow, IonText } from '@ionic/react';
import { Component } from 'react';
import { ScheduledJob, Questionnaire, Survey } from '../interfaces/DataTypes';
import { jobTypes } from '../utils/Constants';
import {
    ValueSelector,
    EventTypeSelector,
    JobNameInput,
    QuestionnaireSelector,
    MessageInput
} from './Components';

interface Props {
    job: ScheduledJob;
    survey: Survey;
    editing: boolean;
    questionnaireList: Questionnaire[];
    setValue: Function;
    setType: Function;
}

interface State {}

class JobDetails extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {};
    }

    onSurveyJoined = () => {
        const { job, questionnaireList, setValue, editing } = this.props;

        return (
            <>
                <IonItem lines='none' class='ion-no-padding'>
                    <b>add respondent to questionnaire</b>
                    <QuestionnaireSelector
                        job={job}
                        name='questionnaireToJoin'
                        questionnaireList={questionnaireList}
                        setValue={setValue}
                        editing={editing}
                    />
                    <b>{job.interval === 0 ? '' : 'after'}</b>
                    <ValueSelector job={job} setValue={setValue} name='interval' editing={editing} />
                    <b>
                        {job.interval === 1 ? 'day' : job.interval === 0 ? '' : 'days'}, and remain available
                        for&nbsp;
                    </b>
                    <ValueSelector job={job} setValue={setValue} name='duration' editing={editing} />
                    <b>{job.duration === 1 ? 'day.' : 'days.'}</b>
                </IonItem>
            </>
        );
    };

    onQuestionniareCompleted = () => {
        const { job, questionnaireList, setValue, editing } = this.props;

        return (
            <>
                <IonItem lines='none'>
                    <QuestionnaireSelector
                        job={job}
                        name='questionnaireCompleted'
                        questionnaireList={questionnaireList}
                        setValue={setValue}
                        editing={editing}
                    />
                </IonItem>
                <IonItem lines='none'>
                    <b>add respondent to questionnaire</b>
                    <QuestionnaireSelector
                        job={job}
                        name='questionnaireToJoin'
                        questionnaireList={questionnaireList}
                        setValue={setValue}
                        editing={editing}
                    />
                    {job.interval === 0 ? '' : <b>after</b>}
                    <ValueSelector job={job} setValue={setValue} name='interval' editing={editing} />
                    <b>
                        {job.interval === 0 ? '' : job.interval === 1 ? 'day' : 'days'}, and remain available
                        for&nbsp;
                    </b>
                    <ValueSelector job={job} setValue={setValue} name='duration' editing={editing} />
                    <b>{job.duration === 1 ? 'day.' : 'days.'}</b>
                </IonItem>
            </>
        );
    };

    onDiaryNotWritten = () => {
        const { job, setValue, editing } = this.props;

        return (
            <>
                <IonItem lines='none' class='ion-no-padding' style={{ width: '900px' }}>
                    <b>for</b>
                    <ValueSelector name='interval' job={job} setValue={setValue} editing={editing} />
                    <b>
                        {job.interval === 1 ? 'day' : 'days'}, send respondent a reminder notification&nbsp;
                    </b>
                    <b>{job.frequency === 0 ? '' : 'every'}</b>
                    <ValueSelector name='frequency' job={job} setValue={setValue} editing={editing} />
                    <b>{job.frequency === 0 ? '' : job.frequency === 1 ? 'day.' : 'days.'}</b>
                </IonItem>
                <MessageInput job={job} setValue={setValue} editing={editing} />
            </>
        );
    };

    onQuestionnaireNotCompleted = () => {
        const { job, setValue, questionnaireList, editing } = this.props;

        return (
            <>
                <IonItem lines='none'>
                    <QuestionnaireSelector
                        job={job}
                        name='questionnaireNotCompleted'
                        editing={editing}
                        setValue={setValue}
                        questionnaireList={questionnaireList}
                    />
                    <b>for</b>
                    <ValueSelector name='interval' job={job} setValue={setValue} editing={editing} />
                    <b>{job.interval === 1 ? 'day' : 'days'}, send a reminder notification&nbsp;</b>
                    <b>{job.frequency === 0 ? '' : 'every'}</b>
                    <ValueSelector name='frequency' job={job} setValue={setValue} editing={editing} />
                    <b>{job.frequency === 0 ? '' : job.frequency === 1 ? 'day.' : 'days.'}</b>
                </IonItem>
                <MessageInput job={job} setValue={setValue} editing={editing} />
            </>
        );
    };

    render() {
        const { job, setValue, setType, editing } = this.props;
        const { type } = job;

        return (
            <IonGrid class='job-details'>
                {editing && (
                    <IonRow>
                        <JobNameInput job={job} setValue={setValue} editing={editing} />
                    </IonRow>
                )}
                <IonRow>
                    <IonText style={{ textIndent: '16px', marginTop: '16px' }}>
                        <b>After</b>
                    </IonText>
                    <EventTypeSelector job={job} setType={setType} editing={editing} />
                    {type === jobTypes.onSurveyJoined.value && this.onSurveyJoined()}
                    {type === jobTypes.onQuestionnaireCompleted.value && this.onQuestionniareCompleted()}
                    {type === jobTypes.onDiaryNotWritten.value && this.onDiaryNotWritten()}
                    {type === jobTypes.onQuestionnaireNotCompleted.value &&
                        this.onQuestionnaireNotCompleted()}
                </IonRow>
            </IonGrid>
        );
    }
}

export default JobDetails;
