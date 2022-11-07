import React, { Component } from 'react';
import {
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonPage,
    IonRow,
    IonSelect,
    IonSelectOption,
    IonText,
    IonTextarea,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import {
    assessmentArr,
    GMFCArr,
    treatmentVals,
    deviceVals,
    clinicalEncounterHealthEventArr,
    outcomeChoices
} from './DiaryMappings';

import '../Diary.css';
import { isEmptyObject } from '../../../../utils/Utils';
import { dateFormats, diaryViews } from '../../../../utils/Constants';
import { format } from 'date-fns';
import { CustomDropdown, Footer, OngoingEvent } from './components';
import { Person, User, Survey } from '../../../../interfaces/DataTypes';
import DatePicker from '../../../components/DatePicker';

interface DrVisitProps {
    setView: Function;
    submitDiary: Function;
    getDiaryEntries: Function;
    profile: User;
    survey: Survey | null;
    participant: Person;
    userId: string;
}

interface DrVisitState {
    healthEvent: number | null;
    ongoingStatus: number | null;
    endDate: string;
    outcome: number | null;
    outcomeSpecification: string;
    formType: string;
    assessers: number | null;
    assesserText: string;
    GMFCScore: string;
    GMFCType: number | null;
    eventDate: string;
    visitReason: string;
    prescription: number | null;
    device: number | null;
    error: boolean;
}

class DoctorVisit extends Component<DrVisitProps, DrVisitState> {
    constructor(props: DrVisitProps) {
        super(props);
        this.state = {
            healthEvent: null,
            ongoingStatus: null,
            endDate: '',
            outcome: null,
            outcomeSpecification: '',
            formType: 'Clinical Visit',
            assessers: null,
            assesserText: '',
            GMFCScore: '',
            GMFCType: null,
            eventDate: '',
            visitReason: '',
            prescription: null,
            device: null,
            error: false
        };
    }

    // accepts any type because this function is being reused for many tpyes of inputs
    handleInputChange = (e: any) => {
        const key = e.target.name;
        let value = e.target.value;

        if (key === 'step' && e.target.value === 0) return;
        if (value && key === 'eventDate') {
            value = format(new Date(value), dateFormats.MMddyyyy);
        }

        if (Object.keys(this.state).includes(key)) {
            this.setState({
                [key]: value
            } as Pick<DrVisitState, keyof DrVisitState>);
        }
    };

    handleSave = () => {
        const {
            healthEvent,
            ongoingStatus,
            endDate,
            outcome,
            outcomeSpecification,
            eventDate,
            visitReason,
            assessers,
            assesserText,
            GMFCType,
            GMFCScore,
            prescription,
            device
        } = this.state;

        const { survey, profile, userId } = this.props;

        const complete =
            !isEmptyObject(healthEvent) &&
            !isEmptyObject(ongoingStatus) &&
            (ongoingStatus === 1 ? !isEmptyObject(endDate) : true) &&
            !isEmptyObject(outcome) &&
            (outcome === 7 ? !isEmptyObject(outcomeSpecification) : true) &&
            !isEmptyObject(eventDate) &&
            !isEmptyObject(visitReason) &&
            !isEmptyObject(assessers) &&
            //@ts-ignore
            (assessers === 5 ? !isEmptyObject(assesserText) : true) &&
            (assessers === 6 || (assessers !== 6 && !isEmptyObject(GMFCType))) &&
            (assessers === 6 ||
                (assessers !== 6 &&
                    (GMFCType !== null && GMFCType < 3 ? !isEmptyObject(GMFCScore) : true))) &&
            !isEmptyObject(prescription) &&
            !isEmptyObject(device);

        if (complete) {
            this.setState({ error: false });
            //@ts-ignore
            const participantId = survey.public
                ? userId
                : profile.participantId.filter((elem: { org: string; id: string }) => {
                      //@ts-ignore
                      return elem.org === survey.org;
                  })[0].id;
            //@ts-ignore
            const org = survey.org;

            const context = {
                //@ts-ignore
                surveyId: this.props.survey.id,
                profileName: this.props.participant.name,
                profileDOB: this.props.participant.dob,
                profileId: this.props.participant.id,
                participantId: participantId,
                org: org,
                ...this.state
            };

            //@ts-ignore
            delete context.error;

            this.props.submitDiary(context);
            this.props.getDiaryEntries();
            this.props.setView(diaryViews.SURVEYSELECTION);
        } else {
            this.setState({ error: true });
        }
    };

    render() {
        const {
            eventDate,
            assesserText,
            GMFCScore,
            GMFCType,
            visitReason,
            prescription,
            healthEvent,
            endDate
        } = this.state;

        const showAssesserBox = this.state.assessers === 5;

        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Clinical Encounter</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent className='ion-padding'>
                    <IonGrid className='form-col'>
                        <IonRow className='form-row'>
                            <IonCol className='form-col'>
                                <CustomDropdown
                                    label='Type of Encounter'
                                    name='healthEvent'
                                    value={healthEvent}
                                    handleInputChange={this.handleInputChange}
                                    optionsArr={clinicalEncounterHealthEventArr}
                                />
                            </IonCol>
                        </IonRow>
                        <IonRow className='form-row'>
                            <IonCol className='form-col'>
                                <DatePicker
                                    label='Date of Clinical Encounter'
                                    required={true}
                                    name='eventDate'
                                    date={eventDate}
                                    setDate={this.handleInputChange}
                                    max={new Date().toISOString()}
                                />
                            </IonCol>
                        </IonRow>
                        <IonRow className='form-row'>
                            <IonCol className='form-col'>
                                <OngoingEvent
                                    handleInputChange={this.handleInputChange}
                                    value={this.state.ongoingStatus}
                                />
                            </IonCol>
                        </IonRow>
                        {this.state.ongoingStatus === 1 && (
                            <IonRow className='form-row'>
                                <IonCol className='form-col'>
                                    <DatePicker
                                        label='End Date of Event'
                                        required={true}
                                        name='endDate'
                                        date={endDate}
                                        setDate={this.handleInputChange}
                                        max={new Date().toISOString()}
                                    />
                                </IonCol>
                            </IonRow>
                        )}
                        <IonRow className='form-row'>
                            <IonCol className='form-col'>
                                <CustomDropdown
                                    label='Outcome of Event'
                                    name='outcome'
                                    value={this.state.outcome}
                                    handleInputChange={this.handleInputChange}
                                    optionsArr={outcomeChoices}
                                />
                            </IonCol>
                        </IonRow>
                        {this.state.outcome === 7 && (
                            <IonRow className='form-row'>
                                <IonCol className='form-col'>
                                    <IonItem lines='none'>
                                        <IonLabel position='stacked'>
                                            Outcome Specification
                                            <IonText color='danger'>*</IonText>
                                        </IonLabel>
                                        <IonInput
                                            className='rounded-input'
                                            value={this.state.outcomeSpecification}
                                            onIonChange={this.handleInputChange}
                                            name='outcomeSpecification'
                                        />
                                    </IonItem>
                                </IonCol>
                            </IonRow>
                        )}
                        <IonRow className='form-row'>
                            <IonCol className='form-col'>
                                <IonItem
                                    style={{
                                        paddingBottom: '10px'
                                    }}>
                                    <IonLabel position='stacked'>
                                        Reason for Clinical Visit<IonText color='danger'>*</IonText>
                                    </IonLabel>
                                    <IonTextarea
                                        placeholder='Reason for visit.'
                                        className='form-textbox'
                                        name='visitReason'
                                        value={visitReason}
                                        rows={4}
                                        cols={20}
                                        onIonChange={(e) => this.handleInputChange(e)}
                                    />
                                </IonItem>
                            </IonCol>
                        </IonRow>
                        <IonRow className='form-row'>
                            <IonCol className='form-col'>
                                <IonItem lines='none'>
                                    <IonLabel className='ion-text-wrap' position='stacked'>
                                        If at a clinical visit, who conducted the gross motor assessment? If
                                        the providers didn’t do this assessment, please choose "Not
                                        applicable."
                                        <IonText color='danger'>*</IonText>
                                    </IonLabel>
                                    <IonSelect
                                        className='rounded-input'
                                        name='assessers'
                                        onIonChange={(e) => this.handleInputChange(e)}>
                                        {assessmentArr.map((str) => {
                                            return (
                                                <IonSelectOption key={str.val} value={str.val}>
                                                    {str.text}
                                                </IonSelectOption>
                                            );
                                        })}
                                    </IonSelect>
                                </IonItem>
                            </IonCol>
                        </IonRow>
                        {showAssesserBox && (
                            <IonRow className='form-row'>
                                <IonCol className='form-col'>
                                    <IonItem lines='none'>
                                        <IonLabel position='stacked'>
                                            Specify Assesser<IonText color='danger'>*</IonText>
                                        </IonLabel>
                                        <IonInput
                                            className='rounded-input'
                                            value={assesserText}
                                            placeholder='Name'
                                            name='assesserText'
                                            onIonChange={(e) => this.handleInputChange(e)}
                                        />
                                    </IonItem>
                                </IonCol>
                            </IonRow>
                        )}
                        {this.state.assessers !== 6 && (
                            <IonRow className='form-row'>
                                <IonCol className='form-col'>
                                    <CustomDropdown
                                        label='Which Gross Motor Function assessment did the provider use?'
                                        name='GMFCType'
                                        value={GMFCType}
                                        handleInputChange={this.handleInputChange}
                                        optionsArr={GMFCArr}
                                    />
                                </IonCol>
                            </IonRow>
                        )}
                        {GMFCType !== null && GMFCType < 3 && (
                            <IonRow className='form-row'>
                                <IonCol className='form-col'>
                                    <IonItem lines='none'>
                                        <IonLabel className='ion-text-wrap' position='stacked'>
                                            Please record the Gross Motor Function Score
                                            <IonText color='danger'>*</IonText>
                                        </IonLabel>
                                        <IonInput
                                            className='rounded-input'
                                            value={GMFCScore}
                                            placeholder='Score'
                                            name='GMFCScore'
                                            onIonChange={(e) => this.handleInputChange(e)}
                                        />
                                    </IonItem>
                                </IonCol>
                            </IonRow>
                        )}
                        <IonRow className='form-row'>
                            <IonCol className='form-col'>
                                <CustomDropdown
                                    label='What treatment was prescribed for the event?'
                                    name='prescription'
                                    value={prescription}
                                    handleInputChange={(e: any) => this.handleInputChange(e)}
                                    optionsArr={treatmentVals}
                                />
                            </IonCol>
                        </IonRow>
                        <IonRow className='form-row'>
                            <IonCol className='form-col'>
                                <IonItem lines='none'>
                                    <IonLabel className='ion-text-wrap' position='stacked'>
                                        What medical or assistive devices does the Participant use to help
                                        move around, communicate, or do things? Mark all that apply
                                        <IonText color='danger'>*</IonText>
                                    </IonLabel>

                                    <IonSelect
                                        multiple={true}
                                        className='rounded-input'
                                        name='device'
                                        onIonChange={(e) => this.handleInputChange(e)}>
                                        {deviceVals.map((str) => {
                                            return (
                                                <IonSelectOption key={str.val} value={str.val}>
                                                    {str.text}
                                                </IonSelectOption>
                                            );
                                        })}
                                    </IonSelect>
                                </IonItem>
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                </IonContent>
                <Footer error={this.state.error} setView={this.props.setView} handleSave={this.handleSave} />
            </IonPage>
        );
    }
}

export default DoctorVisit;
