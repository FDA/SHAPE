import React, { Component, SyntheticEvent } from 'react';

import { IonButton, IonContent, IonInput, IonItem, IonLabel, IonPage, IonToast } from '@ionic/react';
import Loading from '../layout/Loading';
import AppHeader from '../layout/AppHeader';
import { isEmptyObject } from '../../utils/Utils';
import { ParticipantLookup as PL, Choice } from '../../interfaces/DataTypes';
import { environments, routes } from '../../utils/Constants';

interface PassedProps {
    toggleLoading: Function;
    participantLookup: Function;
    resetparticipantLookup: Function;
    loading: boolean;
    participant: PL;
    orgs: Choice[];
    selectedOrg: string;
    isEmpty: boolean;
}

interface ParticipantLookupState {
    participantId: string;
    error: boolean;
}

class ParticipantLookup extends Component<PassedProps, ParticipantLookupState> {
    constructor(props: PassedProps) {
        super(props);
        this.state = {
            participantId: '',
            error: false
        };
    }

    handleSubmit = (e: SyntheticEvent) => {
        e.preventDefault();
        const { participantId } = this.state;
        const { selectedOrg } = this.props;
        if (!isEmptyObject(selectedOrg)) {
            if (process.env.NODE_ENV === environments.DEVELOPMENT)
                console.log(`Trying to lookup patient: ${JSON.stringify(participantId)} `);
            this.props.toggleLoading(true);
            this.props.participantLookup(participantId, selectedOrg);
        } else {
            this.setState({ error: true });
        }
    };

    handleChange = (event: CustomEvent<InputEvent>) => {
        const { value } = event.target as HTMLInputElement;
        this.setState({
            participantId: value
        });
    };

    resetState = () => {
        this.props.resetparticipantLookup();
        this.setState({
            participantId: ''
        });
    };

    componentDidMount() {
        this.resetState();
    }

    render = () => {
        const { loading, participant, isEmpty } = this.props;
        const { participantId } = this.state;
        const registrationExists = !isEmptyObject(participant) ? participant.registrationExists : false;
        const querySuccess = !isEmptyObject(participant) ? participant.querySuccess : false;
        const routerLink = isEmpty ? routes.SECURITY_QUESTIONS : routes.TAB_SECURITY_QUESTIONS;
        const LoadingIndicator = loading ? <Loading /> : null;
        const buttonColor = !querySuccess && !registrationExists ? 'primary' : 'light';
        const nextButton =
            participant && participant.securityQuestions ? (
                <IonButton
                    slot='end'
                    expand='block'
                    fill='solid'
                    id='securityQuestions'
                    routerLink={routerLink}
                    color='primary'>
                    Next
                </IonButton>
            ) : null;

        return (
            <IonPage>
                <AppHeader showHeader={true} text={'Enter Code'} />
                <IonContent className='ion-padding'>
                    <p className='small-text'>
                        Please supply the respondent registration code provided to you for this survey
                        application.
                    </p>
                    {LoadingIndicator}
                    <form onSubmit={(e) => this.handleSubmit(e)}>
                        <IonItem>
                            <IonLabel style={{ textAlignVertical: 'top' }} position='stacked'>
                                Registration Code
                            </IonLabel>
                            <IonInput
                                data-testid='participant-field'
                                clearOnEdit={false}
                                name='participantId'
                                required={true}
                                value={participantId}
                                id='participantId'
                                onIonInput={(e) => this.handleChange(e)}
                            />
                        </IonItem>
                        {!querySuccess && !registrationExists ? (
                            <IonButton
                                data-testid='submit-button'
                                fill='solid'
                                expand='block'
                                type='submit'
                                id='lookup-respondent-button'
                                color={buttonColor}
                                disabled={isEmptyObject(participantId)}>
                                Lookup
                            </IonButton>
                        ) : null}
                        {nextButton}
                    </form>
                    {querySuccess && !registrationExists ? (
                        <p className='small-text'>
                            {' '}
                            Respondent {participant.participantId} Lookup Successful
                        </p>
                    ) : null}
                    <IonToast
                        isOpen={querySuccess !== undefined && querySuccess !== null && !querySuccess}
                        color={'dark'}
                        duration={3000}
                        message=' Respondent Lookup Failed'
                        buttons={[
                            {
                                text: 'x',
                                role: 'cancel'
                            }
                        ]}
                    />

                    <IonToast
                        isOpen={registrationExists}
                        color={'dark'}
                        duration={3000}
                        message='Participant is already registered, please contact your system administrator'
                        onDidDismiss={this.resetState}
                        buttons={[
                            {
                                text: 'x',
                                role: 'cancel'
                            }
                        ]}
                    />
                </IonContent>
            </IonPage>
        );
    };
}

export default ParticipantLookup;
