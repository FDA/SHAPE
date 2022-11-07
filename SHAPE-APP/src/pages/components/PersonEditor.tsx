import React, { Component } from 'react';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonModal,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import { Person } from '../../interfaces/DataTypes';
import DatePicker from './DatePicker';

interface PassedProps {
    person: Person;
    setShowModal: Function;
    showModal: boolean;
    handleSave: Function;
    handleChange: Function;
    handleRemove: Function;
    router: HTMLElement;
}

class PersonEditor extends Component<PassedProps> {
    modalRef: any;

    setModalRef = (element: any) => {
        this.modalRef = element;
    };

    render() {
        const { person, setShowModal, handleSave, handleChange, handleRemove, showModal, router } =
            this.props;
        return (
            <IonModal
                isOpen={showModal}
                swipeToClose={false}
                presentingElement={router || undefined}
                onDidDismiss={() => setShowModal(false)}
                ref={this.setModalRef}
                aria-label={'edit participant modal'}>
                <IonHeader>
                    <IonToolbar>
                        {person.isNew && (
                            <IonTitle>
                                <strong>Add New Participant</strong>
                            </IonTitle>
                        )}
                        {!person.isNew && (
                            <IonTitle>
                                <strong>Edit Participant</strong>
                            </IonTitle>
                        )}
                        <IonButtons slot='start'>
                            <IonButton color='primary' onClick={() => setShowModal(false)}>
                                Cancel
                            </IonButton>
                        </IonButtons>
                        {person.isNew && (
                            <IonButtons slot='end'>
                                <IonButton color='primary' onClick={(e) => handleSave(e)}>
                                    Save
                                </IonButton>
                            </IonButtons>
                        )}
                    </IonToolbar>
                </IonHeader>
                <IonContent className='ion-padding'>
                    <p className='small-text'>
                        This participant will be able to answer questionnaires in the application.
                    </p>
                    <p className='small-text'>Participant information cannot be edited after creation.</p>
                    <IonItem>
                        <IonLabel position='stacked'>Participant's First Name</IonLabel>
                        <IonInput
                            disabled={!person.isNew}
                            name='name'
                            id='name-field'
                            required={true}
                            debounce={1000}
                            value={person.name}
                            onIonInput={(e) => handleChange(e)}
                        />
                    </IonItem>
                    <IonItem>
                        <IonLabel position='stacked'>Sex</IonLabel>
                        <IonSelect
                            disabled={!person.isNew}
                            data-testid='gender-select'
                            className='rounded-input'
                            name='gender'
                            okText='Ok'
                            cancelText='Cancel'
                            onIonChange={(e) => handleChange(e)}
                            value={person.gender}
                            placeholder={'Select Sex'}>
                            <IonSelectOption key={'M'} value={'M'}>
                                Male
                            </IonSelectOption>
                            <IonSelectOption key={'F'} value={'F'}>
                                Female
                            </IonSelectOption>
                        </IonSelect>
                    </IonItem>
                    <DatePicker
                        disabled={!person.isNew}
                        label='Date of Birth'
                        name='dob'
                        date={person.dob}
                        setDate={handleChange}
                        max={new Date().toISOString()}
                    />
                    {!person.isNew && (
                        <IonButton
                            type='button'
                            onClick={(e) => handleRemove(e)}
                            style={{ marginTop: '.5em' }}
                            expand='block'
                            fill='solid'
                            color='danger'>
                            Remove
                        </IonButton>
                    )}
                </IonContent>
            </IonModal>
        );
    }
}

export default PersonEditor;
