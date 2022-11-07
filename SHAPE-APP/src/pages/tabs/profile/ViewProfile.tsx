import React, { Component } from 'react';
import { IonItem, IonLabel, IonText, IonIcon } from '@ionic/react';
import { FirebaseAuth, User } from '../../../interfaces/DataTypes';
import build from '../../../build-info.json';
import { informationCircleSharp } from 'ionicons/icons';

interface PassedProps {
    profile: User;
    fireBaseAuth: FirebaseAuth;
    isEditing: boolean;
    show: boolean;
}

class ViewProfile extends Component<PassedProps, {}> {
    render() {
        const { profile, fireBaseAuth, isEditing, show } = this.props;
        if (!show || isEditing) {
            return null;
        }
        return (
            <>
                <p className='small-text'>User ID: {fireBaseAuth.uid}</p>
                <p className='small-text'>
                    Build Info: {build.build}, {build.buildDate}&nbsp;
                    <a
                        href='https://patientexperience.app'
                        target='_blank'
                        rel='noopener noreferrer'
                        title='About SHAPE'>
                        <IonIcon icon={informationCircleSharp} aria-label={'information icon'} />
                    </a>
                </p>
                <IonItem>
                    <IonLabel position='stacked'>First Name</IonLabel>
                    <IonText>{profile.firstName}</IonText>
                </IonItem>
                <IonItem>
                    <IonLabel position='stacked'>Last Name</IonLabel>
                    <IonText>{profile.lastName}</IonText>
                </IonItem>
                <IonItem>
                    <IonLabel position='stacked'>Telephone Number (Voice and SMS)</IonLabel>
                    <IonText>{profile.phoneNumber}</IonText>
                </IonItem>
                <IonItem>
                    <IonLabel position='stacked'>User ID (Email Address)</IonLabel>
                    <IonText>{fireBaseAuth.email}</IonText>
                </IonItem>
                <br />
                <br />
                <p className='small-text'>Orgs & Participant IDs</p>
                {profile.participantId.map((participantId, index) => {
                    return (
                        <IonItem key={index}>
                            <IonLabel position='stacked'>{participantId.org}</IonLabel>
                            <IonText>{participantId.id}</IonText>
                        </IonItem>
                    );
                })}
            </>
        );
    }
}

export default ViewProfile;
