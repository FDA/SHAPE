import React, { Component, SyntheticEvent } from 'react';
import { IonButton, IonIcon, IonItem, IonLabel, IonList, IonText, IonToast } from '@ionic/react';
import { format } from 'date-fns';
import { Redirect } from 'react-router';
import PersonEditor from '../../components/PersonEditor';
import { Person, User, FirebaseAuth } from '../../../interfaces/DataTypes';
import { addCircle } from 'ionicons/icons';
import { guid, isEmptyObject } from '../../../utils/Utils';
import { dateFormats, routes, environments } from '../../../utils/Constants';

import { cloneDeep } from 'lodash';

interface PassedProps {
    show: boolean;
    toggleEdit: Function;
    profile: User;
    updateParticipant: Function;
    fireBaseAuth: FirebaseAuth;
    routerRef: HTMLElement;
}

interface EditParticipantState {
    person: Person;
    participants: Array<Person>;
    error: boolean;
    errorMessage: string;
    showModal: boolean;
}

class EditParticipant extends Component<PassedProps, EditParticipantState> {
    constructor(props: PassedProps) {
        super(props);

        this.state = {
            error: false,
            errorMessage: '',
            person: { name: '', dob: '', id: guid(), isNew: true, gender: '' },
            showModal: false,
            participants: cloneDeep(this.props.profile.profiles)
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.handleRemove = this.handleRemove.bind(this);
    }

    add = () => {
        const person = { name: '', dob: '', id: guid(), isNew: true, gender: '' };
        this.setState({ person: person });
        this.setShowModal(true);
    };

    personEditor = (person: Person) => {
        delete person.isNew;
        this.setState({ person: person, showModal: true });
    };

    setShowModal = (show: boolean) => {
        this.setState({ showModal: show });
    };

    toggleError = (msg: string) => {
        this.setState({ error: !this.state.error, errorMessage: msg });
    };

    handleSave = (e: SyntheticEvent) => {
        e.preventDefault();
        const { person, participants } = this.state;
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
            this.setState({ participants: participants });
            this.save(participants);
            this.setShowModal(false);
        } else {
            this.toggleError('name, sex and date of birth are required');
        }
    };

    handleRemove = (e: SyntheticEvent) => {
        e.preventDefault();
        const { person, participants } = this.state;
        if (process.env.NODE_ENV === environments.DEVELOPMENT)
            console.log(`Removing Person: ${person.name} DOB: ${person.dob} IDX: ${person.id}`);
        const updatedParticipants = participants.filter((elem: Person) => {
            return elem.id !== person.id;
        });
        this.setState({ participants: updatedParticipants });
        this.setShowModal(false);
        this.save(updatedParticipants);
    };

    handleChange = (event: any) => {
        const { name, value } = event.target;
        const { person } = this.state;
        this.setState({
            person: {
                ...person,
                [name]: value
            }
        });
    };

    save = (participants: Array<Person>) => {
        const { fireBaseAuth } = this.props;
        this.props.updateParticipant(fireBaseAuth.uid, { profiles: participants });
    };

    render() {
        const { show, routerRef } = this.props;
        const { participants, showModal, error, errorMessage, person } = this.state;
        const { isEmpty } = this.props.fireBaseAuth;
        if (isEmpty) return <Redirect to={routes.LOGIN} />;
        if (!show) {
            return null;
        }

        const participantsList = participants.map((p: Person) => {
            return (
                <IonItem button key={p.id} detail={true} onClick={() => this.personEditor(p)}>
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

        const listAddButton = participants.length > 0 && (
            <IonItem button detail={false} onClick={() => this.add()}>
                <IonIcon color='primary' size='large' slot='start' icon={addCircle} aria-label={'add icon'} />
                <IonLabel color='primary'>
                    <strong>Add Participant</strong>
                </IonLabel>
            </IonItem>
        );

        const addButton = participants.length === 0 && (
            <IonButton expand='block' fill='solid' id='addPButton' color='primary' onClick={() => this.add()}>
                Add Participant
            </IonButton>
        );

        return (
            <>
                <p className='small-text'>
                    Click the blue <IonText color='primary'>Add Participant</IonText> button to include
                    participants. If you are the participant (or one of the participants) add yourself.
                </p>
                <p className='small-text'>
                    Click the participant's name to view details or remove their profile.
                </p>
                <IonList lines='full'>
                    {participantsList}
                    {listAddButton}
                    {addButton}
                </IonList>

                <PersonEditor
                    person={person}
                    setShowModal={this.setShowModal}
                    showModal={showModal}
                    handleSave={this.handleSave}
                    handleChange={this.handleChange}
                    handleRemove={this.handleRemove}
                    router={routerRef}
                />
                <IonToast
                    isOpen={error && errorMessage.length > 0}
                    message={errorMessage}
                    color={'danger'}
                    duration={2000}
                    onWillDismiss={() => this.toggleError('')}
                />
            </>
        );
    }
}

export default EditParticipant;
