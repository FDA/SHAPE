import React, { Component } from 'react';
import {
    IonContent,
    IonLabel,
    IonPage,
    IonSegment,
    IonSegmentButton,
    IonToast,
    IonToolbar
} from '@ionic/react';
import AppHeader from '../../layout/AppHeader';
import { Redirect } from 'react-router';
import EditPreferences from './EditPreferences';
import ProfileEditSave from './ProfileEditSave';
import EditParticipant from './EditParticipant';
import ViewProfile from './ViewProfile';
import EditProfile from './EditProfile';
import { registerForPush } from '../../../utils/Utils';
import Loading from '../../layout/Loading';
import { User, RegisteringUser, FirebaseAuth } from '../../../interfaces/DataTypes';
import { routes } from '../../../utils/Constants';
import PreferenceButtons from './PreferenceButtons';

interface PassedProps {
    logout: Function;
    profile: User;
    fireBaseAuth: FirebaseAuth;
    resetEHR: Function;
    resetPassword: Function;
    updateParticipantDeviceToken: Function;
    updateParticipant: Function;
    isLoading: boolean;
}

interface ProfileState {
    editing: boolean;
    user: RegisteringUser;
    name: string;
    value: string;
    segment: string;
    goHome: boolean;
    validationError: {
        error: boolean;
        message: string;
    };
}

const segments = {
    RESPONDENT: 'respondent',
    PARTICIPANT: 'participant',
    PREFERENCES: 'preferences'
};

class Profile extends Component<PassedProps, ProfileState> {
    routerRef: any;

    constructor(props: PassedProps) {
        super(props);
        this.state = {
            editing: false,
            user: {
                userName: '',
                phoneNumber: '',
                firstName: '',
                lastName: '',
                emailEnabled: false,
                smsEnabled: false,
                pushEnabled: false
            },
            name: '',
            value: '',
            segment: 'respondent',
            goHome: false,
            validationError: {
                error: false,
                message: ''
            }
        };
        this.toggleEdit = this.toggleEdit.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.setChecked = this.setChecked.bind(this);
        this.logout = this.logout.bind(this);
        this.resetPassword = this.resetPassword.bind(this);
        this.handlePhone = this.handlePhone.bind(this);
    }

    logout = () => {
        this.props.logout();
        this.setState({ goHome: true });
    };

    load = () => {
        const { profile, fireBaseAuth } = this.props;

        this.setState({
            user: {
                ...this.state.user,
                firstName: profile.firstName,
                lastName: profile.lastName,
                phoneNumber: profile.phoneNumber,
                userName: fireBaseAuth.email,
                emailEnabled: profile.emailEnabled,
                smsEnabled: profile.smsEnabled,
                pushEnabled: profile.pushEnabled
            },
            goHome: false
        });
    };

    setChecked = (type: string, value: boolean) => {
        if (type !== undefined && value !== undefined) {
            this.setState({
                user: {
                    ...this.state.user,
                    [type]: value
                }
            });
        }
    };

    UNSAFE_componentWillMount() {
        this.props.resetEHR();
        this.load();
    }

    setSegment = (segment: string) => {
        this.setState({ segment: segment });
    };

    toggleEdit = () => {
        this.setState({ editing: !this.state.editing });
    };

    resetPassword = () => {
        const { fireBaseAuth } = this.props;
        this.props.resetPassword(fireBaseAuth.email);
    };
    handlePhone = (phone: string) => {
        const { user } = this.state;
        this.setState({
            user: {
                ...user,
                phoneNumber: phone
            }
        });
    };

    handleChange = (e: any) => {
        this.setState({
            user: {
                ...this.state.user,
                [e.target.name]: e.target.value
            }
        });
    };

    handleSubmit = (e: any) => {
        const { user } = this.state;
        const { fireBaseAuth, profile } = this.props;

        if (e) {
            e.preventDefault();
        }
        const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
        if (phoneRegex.test(user.phoneNumber)) {
            const formattedPhoneNumber = user.phoneNumber.replace(phoneRegex, '$1-$2-$3');
            user.phoneNumber = formattedPhoneNumber;

            //check if user was not registered before asking for push notification access
            if (this.state.user.pushEnabled === true && profile.pushEnabled === false) {
                registerForPush(fireBaseAuth.uid, this.props.updateParticipantDeviceToken).then(
                    (res: any) => {
                        if (res === false) {
                            user.pushEnabled = false;
                            this.setChecked('pushEnabled', false);
                            window.alert(
                                "Push notifications are disabled for SHAPE on your phone. You can change this by modifying your device's notification settings."
                            );
                        }
                    }
                );
            }

            this.props.updateParticipant(fireBaseAuth.uid, user);
            this.toggleEdit();
        } else {
            this.setState({
                validationError: {
                    error: true,
                    message: 'Please enter a valid phone number'
                }
            });
        }
    };

    setRouterRef = (element: any) => {
        this.routerRef = element;
    };

    render() {
        const { editing, user, segment, goHome, validationError } = this.state;
        const { profile, fireBaseAuth, isLoading } = this.props;
        const { isEmpty } = fireBaseAuth;
        if (isEmpty || goHome) return <Redirect to={routes.LOGIN} />;
        return (
            <IonPage ref={this.setRouterRef}>
                <AppHeader showHeader={true} text={'Profile'} noBorder={true} />
                <IonToolbar>
                    <IonSegment value={segment} onIonChange={(e) => this.setSegment(e.detail.value as any)}>
                        <IonSegmentButton value='respondent'>
                            <IonLabel>Respondent</IonLabel>
                        </IonSegmentButton>
                        <IonSegmentButton value='participant'>
                            <IonLabel>Participants</IonLabel>
                        </IonSegmentButton>
                        <IonSegmentButton value='preferences'>
                            <IonLabel>Preferences</IonLabel>
                        </IonSegmentButton>
                    </IonSegment>
                </IonToolbar>

                <IonContent className='ion-padding'>
                    <ViewProfile
                        isEditing={editing}
                        profile={profile}
                        fireBaseAuth={fireBaseAuth}
                        show={segment === segments.RESPONDENT}
                    />
                    <EditParticipant
                        show={segment === segments.PARTICIPANT}
                        toggleEdit={this.toggleEdit}
                        profile={profile}
                        updateParticipant={this.props.updateParticipant}
                        fireBaseAuth={fireBaseAuth}
                        routerRef={this.routerRef}
                    />
                    <EditProfile
                        isEditing={editing}
                        user={user}
                        handleChange={this.handleChange}
                        handleSubmit={this.handleSubmit}
                        toggleEdit={this.toggleEdit}
                        handlePhone={this.handlePhone}
                        show={segment === segments.RESPONDENT}
                    />

                    <EditPreferences
                        show={segment === segments.PREFERENCES}
                        user={user}
                        handleSubmit={this.handleSubmit}
                        setChecked={this.setChecked}
                        resetPassword={this.resetPassword}
                        logout={this.logout}
                    />
                </IonContent>

                <ProfileEditSave
                    show={segment === segments.RESPONDENT}
                    isEditing={editing}
                    toggleEdit={this.toggleEdit}
                />

                <PreferenceButtons
                    show={segment === segments.PREFERENCES}
                    resetPassword={this.resetPassword}
                    logout={this.logout}
                />

                <IonToast
                    isOpen={validationError.error}
                    color={'danger'}
                    message={validationError.message}
                    buttons={[
                        {
                            text: 'Okay',
                            role: 'cancel',
                            handler: () => {
                                this.setState({
                                    validationError: { error: false, message: '' }
                                });
                            }
                        }
                    ]}
                />

                {isLoading && <Loading />}
            </IonPage>
        );
    }
}

export default Profile;
