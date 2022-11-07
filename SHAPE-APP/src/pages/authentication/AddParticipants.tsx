import React, { Component, SyntheticEvent } from 'react';
import {
    IonButton,
    IonContent,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonPage,
    IonText,
    IonToast
} from '@ionic/react';
import Loading from '../layout/Loading';
import { addCircle } from 'ionicons/icons';
import { format } from 'date-fns';
import { Person } from '../../interfaces/DataTypes';
import { isEmptyObject, guid } from '../../utils/Utils';
import AppHeader from '../layout/AppHeader';
import PersonEditor from '../components/PersonEditor';
import { dateFormats, environments, routes } from '../../utils/Constants';

interface PassedProps {
    names: Array<Person>;
    addParticipantNames: Function;
    isLoading: boolean;
}

interface AddParticipantState {
    person: Person;
    showModal: boolean;
    error: boolean;
    errorMessage: string;
}

class AddParticipants extends Component<PassedProps, AddParticipantState> {
    routerRef: any;

    constructor(props: PassedProps) {
        super(props);

        this.state = {
            showModal: false,
            person: {
                name: '',
                dob: '',
                id: 0,
                isNew: true,
                gender: ''
            },
            error: false,
            errorMessage: ''
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.handleRemove = this.handleRemove.bind(this);
    }

    add = () => {
        const person = {
            name: '',
            dob: '',
            id: guid(),
            isNew: true,
            gender: ''
        };
        this.setState({ person: person });
        this.setShowModal(true);
    };

    personEditor = (person: Person) => {
        delete person.isNew;
        this.setState({ person: person, showModal: true });
    };

    addNames = (participants: Array<Person>) => {
        if (process.env.NODE_ENV === environments.DEVELOPMENT)
            console.log(`Adding names: ${JSON.stringify(participants)} to the participant redux store`);
        this.props.addParticipantNames(participants);
    };

    setShowModal = (show: boolean) => {
        this.setState({ showModal: show });
    };

    toggleError = (msg: string) => {
        this.setState({ error: !this.state.error, errorMessage: msg });
    };

    handleSave = (e: SyntheticEvent) => {
        e.preventDefault();
        const { person } = this.state;
        const participants = this.props.names;

        if (!isEmptyObject(person.dob) && !isEmptyObject(person.name) && !isEmptyObject(person.gender)) {
            try {
                person.dob = format(new Date(person.dob), dateFormats.MMddyyyy);
            } catch (err) {
                this.setState({ person: { ...person, dob: '' } });
                return this.toggleError('invalid date of birth');
            }
            if (process.env.NODE_ENV === environments.DEVELOPMENT)
                console.log(`Person: ${person.name} DOB: ${person.dob} IDX: ${person.id}`);

            delete person.isNew;
            const index = participants.findIndex((p: Person) => p.id === person.id);
            if (index === -1) {
                participants.push(person);
            } else {
                participants[index] = person;
            }
            this.addNames(participants);
            this.setShowModal(false);
        } else {
            this.toggleError('name, sex and date of birth are required');
        }
    };

    handleRemove = (e: SyntheticEvent) => {
        e.preventDefault();
        const participants = this.props.names;
        const { person } = this.state;
        if (process.env.NODE_ENV === environments.DEVELOPMENT)
            console.log(`Removing Person: ${person.name} DOB: ${person.dob} IDX: ${person.id}`);
        const updatedParticipants = participants.filter((p: Person) => {
            return p.id !== person.id;
        });
        this.props.addParticipantNames(updatedParticipants);
        this.setShowModal(false);
    };

    handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        const { person } = this.state;
        this.setState({
            person: {
                ...person,
                [name]: value
            }
        });
    };

    setRouterRef = (element: any) => {
        this.routerRef = element;
    };

    render() {
        const participants = this.props.names;
        const { isLoading } = this.props;
        const LoadingIndicator = isLoading ? <Loading /> : null;
        const { person, showModal, error, errorMessage } = this.state;
        const shouldProceed = participants.length > 0;

        const participantList = participants.map((p: Person) => {
            return (
                <IonItem detail={true} key={p.id} button onClick={() => this.personEditor(p)}>
                    <IonLabel>
                        <h2>
                            {p.name} ({p.gender}){' '}
                        </h2>
                    </IonLabel>
                    <IonLabel slot='end'>
                        <p>DOB: {p.dob}</p>
                    </IonLabel>
                </IonItem>
            );
        });

        const navButton = shouldProceed ? (
            <IonButton
                expand='block'
                fill='solid'
                routerLink={routes.REGISTER}
                id='nextButton'
                color='primary'>
                Next
            </IonButton>
        ) : (
            <IonButton expand='block' fill='solid' id='addPButton' color='primary' onClick={() => this.add()}>
                Add Participant
            </IonButton>
        );

        return (
            <IonPage ref={this.setRouterRef}>
                <AppHeader showHeader={true} text={'Add Participants'} />
                <IonContent className='ion-padding'>
                    {LoadingIndicator}
                    <p className='small-text'>
                        Click the blue <IonText color='primary'>Add Participant</IonText> button to include
                        participants. If you are the participant (or one of the participants) add yourself.
                    </p>
                    <p className='small-text'>
                        Click the participant's name to view details or remove their profile.
                    </p>
                    <IonList lines='full'>
                        {participantList}
                        {shouldProceed && (
                            <IonItem detail={false} button={true} onClick={() => this.add()}>
                                <IonIcon
                                    color='primary'
                                    size='large'
                                    slot='start'
                                    icon={addCircle}
                                    aria-label={'add participant icon'}
                                />
                                <IonLabel color='primary'>
                                    <strong>Add Participant</strong>
                                </IonLabel>
                            </IonItem>
                        )}
                    </IonList>
                    {navButton}
                    <PersonEditor
                        person={person}
                        setShowModal={this.setShowModal}
                        showModal={showModal}
                        handleSave={this.handleSave}
                        handleChange={this.handleChange}
                        handleRemove={this.handleRemove}
                        router={this.routerRef}
                    />
                </IonContent>
                <IonToast
                    isOpen={error && errorMessage.length > 0}
                    message={errorMessage}
                    color={'danger'}
                    duration={2000}
                    onWillDismiss={() => this.toggleError('')}
                />
            </IonPage>
        );
    }
}

export default AddParticipants;
