import {
    IonButton,
    IonButtons,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonText,
    IonTextarea,
    IonToggle
} from '@ionic/react';
import { trash } from 'ionicons/icons';
import { SelectOption, Questionnaire, ScheduledJob } from '../interfaces/DataTypes';
import { jobTypes } from '../utils/Constants';
import './ScheduledJobs.css';

interface JobNameInputProps {
    job: ScheduledJob;
    setValue: Function;
    editing: boolean;
}

export const JobNameInput = (props: JobNameInputProps) => {
    const { job, setValue, editing } = props;
    return (
        <IonItem class='job-name'>
            <IonLabel position='stacked'>
                <b>Job Name</b>
            </IonLabel>
            <IonTextarea
                disabled={!editing}
                autoGrow
                placeholder='click to type'
                value={job.name}
                onIonChange={(e) => setValue('name', e.detail.value)}
            />
        </IonItem>
    );
};

interface MessageInputProps {
    job: ScheduledJob;
    setValue: Function;
    editing: boolean;
}

export const MessageInput = (props: MessageInputProps) => {
    const { job, setValue, editing } = props;

    return (
        <IonItem class='job-message'>
            <IonLabel position='stacked'>
                <b>Notification Message</b>
            </IonLabel>
            <IonTextarea
                disabled={!editing}
                autoGrow
                placeholder='click to type'
                value={job.message}
                onIonChange={(e) => setValue('message', e.detail.value)}
            />
        </IonItem>
    );
};
interface EventTypeSelectorProps {
    job: ScheduledJob;
    setType: Function;
    editing: boolean;
}

export const EventTypeSelector = (props: EventTypeSelectorProps) => {
    const { job, setType, editing } = props;

    return (
        <IonItem>
            <IonSelect
                disabled={!editing}
                placeholder='click to select'
                interface='popover'
                value={job.type}
                onIonChange={(e) => setType(e.detail.value)}>
                {Object.entries(jobTypes).map((typeArr: any[]) => {
                    return (
                        <IonSelectOption key={typeArr[0]} value={typeArr[1].value}>
                            {typeArr[1].name}
                        </IonSelectOption>
                    );
                })}
            </IonSelect>
        </IonItem>
    );
};

interface QuestionnaireSelectorProps {
    job: ScheduledJob;
    questionnaireList: Questionnaire[];
    name: keyof ScheduledJob;
    setValue: Function;
    editing: boolean;
}

export const QuestionnaireSelector = (props: QuestionnaireSelectorProps) => {
    const { job, setValue, questionnaireList, name, editing } = props;

    return (
        <IonItem style={{ maxWidth: '350px' }}>
            <IonSelect
                disabled={!editing}
                placeholder='click to select'
                interface='popover'
                value={job[name]}
                onIonChange={(e) => setValue(name, e.detail.value)}>
                {questionnaireList
                    .filter((q: Questionnaire) => {
                        if (
                            job.type === jobTypes.onQuestionnaireCompleted.value &&
                            name === 'questionnaireToJoin'
                        ) {
                            return q.id !== job.questionnaireCompleted;
                        }
                        return true;
                    })
                    .map((questionnaire: Questionnaire) => {
                        return (
                            <div key={questionnaire.id}>
                                <IonSelectOption value={questionnaire.id}>
                                    {questionnaire.name}&nbsp;&nbsp;
                                    <QuestionnaireStatus
                                        id={questionnaire.id}
                                        questionnaireList={questionnaireList}
                                    />
                                </IonSelectOption>
                            </div>
                        );
                    })}
            </IonSelect>
        </IonItem>
    );
};

interface QuestionnaireStatusProps {
    id: string;
    questionnaireList: Questionnaire[];
}

const QuestionnaireStatus = (props: QuestionnaireStatusProps) => {
    const { id, questionnaireList } = props;
    const questionnaire = questionnaireList.find((q: Questionnaire) => q.id === id);

    if (questionnaire) {
        let status;
        let textColor;
        if (questionnaire.open) {
            status = 'open';
            textColor = 'success';
        } else {
            if (questionnaire.locked) {
                status = 'closed';
                textColor = 'danger';
            } else {
                status = 'draft';
                textColor = '';
            }
        }

        return <IonText color={textColor}>[{status}]</IonText>;
    }
    return <div></div>;
};

interface InputProps {
    job: ScheduledJob;
    setValue: Function;
    name: keyof ScheduledJob;
    editing: boolean;
}

export const NumberInput = (props: InputProps) => {
    const { job, setValue, name, editing } = props;

    return (
        <IonItem>
            <IonInput
                disabled={!editing}
                placeholder='select'
                //@ts-ignore
                value={job[name]}
                type='number'
                debounce={500}
                min={1}
                onIonChange={(e) => setValue(name, Number(e.detail.value))}
            />
        </IonItem>
    );
};

interface SelectorProps {
    job: ScheduledJob;
    setValue: Function;
    name: keyof ScheduledJob;
    editing: boolean;
}

export const ValueSelector = (props: SelectorProps) => {
    const { job, setValue, name, editing } = props;
    const options = getSelectOptions(job, name);

    return (
        <IonItem>
            <IonSelect
                disabled={!editing}
                placeholder='click to select'
                interface='popover'
                value={job[name]}
                onIonChange={(e) => setValue(name, e.detail.value)}>
                {options.map((option: SelectOption) => {
                    return (
                        <IonSelectOption value={option.value} key={option.value}>
                            {option.name}
                        </IonSelectOption>
                    );
                })}
            </IonSelect>
        </IonItem>
    );
};

const getSelectOptions = (job: ScheduledJob, name: string) => {
    const { type } = job;
    const arr = [...Array(366).keys()];
    const options: any = arr.map((val: number) => {
        return { value: val, name: val };
    });
    options.shift();

    if (type === jobTypes.onSurveyJoined.value || type === jobTypes.onQuestionnaireCompleted.value) {
        if (name === 'interval') {
            options.unshift({ value: 0, name: 'immediately' });
        } else if (name === 'duration') {
            options.unshift({ value: 0, name: 'always' });
        }
    } else if (
        type === jobTypes.onDiaryNotWritten.value ||
        type === jobTypes.onQuestionnaireNotCompleted.value
    ) {
        if (name === 'frequency') {
            options.unshift({ value: 0, name: 'one time' });
        }
    }
    return options;
};

interface JobButtonsProps {
    editing: boolean;
    disabled: boolean;
    job: ScheduledJob;
    saveEditJob: Function;
    cancelEditJob: Function;
    deleteJob: Function;
    setEditJob: Function;
    setEnabled: Function;
}

export const JobButtons = (props: JobButtonsProps) => {
    const { editing, job, disabled, saveEditJob, cancelEditJob, setEditJob, deleteJob, setEnabled } = props;

    return (
        <IonButtons class='job-buttons'>
            <JobEnabledToggle editing={editing} job={job} setEnabled={setEnabled} />
            {editing ? (
                <>
                    <IonButton fill='outline' color='primary' onClick={() => saveEditJob()}>
                        Save
                    </IonButton>
                    <IonButton fill='outline' color='tertiary' onClick={() => cancelEditJob()}>
                        Cancel
                    </IonButton>
                </>
            ) : (
                <IonButton
                    fill='solid'
                    color='primary'
                    disabled={disabled}
                    onClick={() => setEditJob(job.id)}>
                    Edit
                </IonButton>
            )}
            <IonButton fill='solid' color='danger' onClick={() => deleteJob(job.id)}>
                <IonIcon icon={trash} />
            </IonButton>
        </IonButtons>
    );
};

interface NewJobButtonsProps {
    newJob: ScheduledJob;
    saveNewJob: Function;
    deleteJob: Function;
}

export const NewJobButtons = (props: NewJobButtonsProps) => {
    const { newJob, saveNewJob, deleteJob } = props;

    return (
        <IonButtons class='job-buttons'>
            <IonButton fill='outline' color='primary' onClick={() => saveNewJob()}>
                Save
            </IonButton>
            <IonButton fill='solid' color='danger' onClick={() => deleteJob(newJob.id)}>
                <IonIcon icon={trash} />
            </IonButton>
        </IonButtons>
    );
};

interface JobEnabledToggleProps {
    editing: boolean;
    job: ScheduledJob;
    setEnabled: Function;
}

export const JobEnabledToggle = (props: JobEnabledToggleProps) => {
    const { editing, job, setEnabled } = props;

    return (
        <IonItem disabled={editing} lines='none'>
            <IonToggle
                checked={job.enabled}
                color='success'
                onIonChange={(e) => {
                    setEnabled(job, e.detail.checked);
                }}
            />
            {job.enabled ? 'ON' : 'OFF'}
        </IonItem>
    );
};
