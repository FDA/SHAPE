import React, { Component } from 'react';
import { IonToolbar, IonGrid, IonRow, IonCol, IonTitle, IonPage, IonHeader, IonContent } from '@ionic/react';
import '../Diary.css';
import { isEmptyObject } from '../../../../utils/Utils';
import { dateFormats, diaryViews } from '../../../../utils/Constants';
import { WithdrawalReason, Footer } from './components';
import { User, Survey, Person } from '../../../../interfaces/DataTypes';
import { format } from 'date-fns';
import DatePicker from '../../../components/DatePicker';

interface EventFormProps {
    setView: Function;
    submitDiary: Function;
    getDiaryEntries: Function;
    profile: User;
    survey: Survey | null;
    participant: Person;
    userId: string;
}

interface EventFormState {
    formType: string;
    withdrawalDate: string;
    withdrawalReason: string;
    error: boolean;
}

class Withdrawal extends Component<EventFormProps, EventFormState> {
    constructor(props: EventFormProps) {
        super(props);
        this.state = {
            formType: 'Withdrawal',
            withdrawalDate: '',
            withdrawalReason: '',
            error: false
        };
    }

    handleInputChange = (e: any) => {
        const key = e.target.name;
        let value = e.target.value;

        if (value && key === 'withdrawalDate') {
            value = format(new Date(value), dateFormats.MMddyyyy);
        }

        if (Object.keys(this.state).includes(key)) {
            this.setState({
                [key]: value
            } as Pick<EventFormState, keyof EventFormState>);
        }
    };

    handleSave = () => {
        const { withdrawalDate, withdrawalReason } = this.state;
        const complete = !isEmptyObject(withdrawalDate) && !isEmptyObject(withdrawalReason);

        if (complete) {
            this.setState({ error: false });

            const { survey, profile, userId } = this.props;
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
        const { withdrawalDate, withdrawalReason } = this.state;

        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Withdrawal</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent className='ion-padding'>
                    <IonGrid className='form-col'>
                        <IonRow className='form-row'>
                            <IonCol className='form-col'>
                                <DatePicker
                                    label='Date of Withdrawal'
                                    name='withdrawalDate'
                                    required={true}
                                    date={withdrawalDate}
                                    setDate={this.handleInputChange}
                                    max={new Date().toISOString()}
                                />
                            </IonCol>
                        </IonRow>
                        <IonRow className='form-row'>
                            <IonCol className='form-col'>
                                <WithdrawalReason
                                    handleInputChange={this.handleInputChange}
                                    value={withdrawalReason}
                                />
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                </IonContent>
                <Footer error={this.state.error} setView={this.props.setView} handleSave={this.handleSave} />
            </IonPage>
        );
    }
}

export default Withdrawal;
