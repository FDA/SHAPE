import React, { Component, SyntheticEvent } from 'react';
import Loading from '../layout/Loading';
import {
    IonButton,
    IonToggle,
    IonContent,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonPage,
    IonText,
    IonToast,
    isPlatform,
    IonSelect,
    IonSelectOption,
    SelectChangeEventDetail
} from '@ionic/react';
import AppHeader from '../layout/AppHeader';
import { Redirect } from 'react-router';
import { eyeOffSharp, eyeSharp } from 'ionicons/icons';
import PhoneNumberMaskInput from '../components/PhoneNumberMaskInput';
import {
    Participant,
    Person,
    AuthenticationObject,
    FirebaseAuth,
    RegisteringUserWithPassword
} from '../../interfaces/DataTypes';
import { isEmptyObject, guid } from '../../utils/Utils';
import { routes, images, dateFormats } from '../../utils/Constants';
import DatePicker from '../components/DatePicker';
import { format } from 'date-fns';

interface Error {
    error: boolean;
    message: string;
}

interface PassedProps {
    participant: Participant;
    names: Array<Person>;
    toggleLoading: Function;
    register: Function;
    logout: Function;
    loading: boolean;
    authentication: AuthenticationObject;
    fireBaseAuth: FirebaseAuth;
    resetparticipantLookup: Function;
    authError: string | null;
    clearAuthError: Function;
}

interface RegisterState {
    user: RegisteringUserWithPassword;
    validationError: Error;
    showPassword: boolean;
    goHome: boolean;
    dob: string;
    gender: string;
}

class Register extends Component<PassedProps, RegisterState> {
    constructor(props: PassedProps) {
        super(props);
        this.state = {
            user: {
                userName: '',
                password: '',
                phoneNumber: '',
                firstName: '',
                lastName: '',
                emailEnabled: true,
                smsEnabled: true,
                pushEnabled: isPlatform('capacitor')
            },
            goHome: false,
            validationError: {
                error: false,
                message: ''
            },
            showPassword: false,
            dob: '',
            gender: ''
        };
        this.handlePhone = this.handlePhone.bind(this);
    }

    handleSubmit = (e: SyntheticEvent) => {
        e.preventDefault();
        const { user, dob, gender } = this.state;
        const { participant, names } = this.props;
        let valid = true;
        let formatdob = dob;

        // user is registering for themselves
        if (isEmptyObject(names)) {
            if (isEmptyObject(dob) || isEmptyObject(gender)) {
                valid = false;
                this.setState({
                    validationError: {
                        error: true,
                        message: 'Please ensure date of birth and sex are provided.'
                    }
                });
            } else {
                try {
                    formatdob = format(new Date(dob), dateFormats.MMddyyyy);
                } catch (err) {
                    console.error('invalid date format: ' + err);
                }

                const person = {
                    id: guid(),
                    name: user.firstName,
                    dob: formatdob,
                    gender: gender
                };
                names.push(person);
            }
        }

        const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
        if (phoneRegex.test(user.phoneNumber)) {
            const formattedPhoneNumber = user.phoneNumber.replace(phoneRegex, '$1-$2-$3');
            user.phoneNumber = formattedPhoneNumber;
        } else {
            valid = false;
            this.setState({
                validationError: {
                    error: true,
                    message: 'Please enter a valid phone number'
                }
            });
        }

        if (valid) {
            const userToCreate = {
                ...user,
                profiles: names,
                org: participant.org ? [participant.org] : [],
                participantId: participant.org
                    ? [{ org: participant.org, id: participant.participantId }]
                    : []
            };

            this.props.toggleLoading(true);
            this.props.register(userToCreate);
        }
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

    handleChange = (event: CustomEvent<InputEvent>) => {
        const { name, value } = event.target as HTMLInputElement;
        const { user } = this.state;
        this.setState({
            user: {
                ...user,
                [name]: value
            }
        });
    };

    handleDOBChange = (event: CustomEvent<InputEvent>) => {
        const { value } = event.target as HTMLInputElement;
        this.setState({
            dob: value
        });
    };

    handleGenderChange = (event: CustomEvent<SelectChangeEventDetail<any>>) => {
        const { value } = event.target as HTMLInputElement;
        this.setState({
            gender: value
        });
    };

    setChecked = (type: string, value: boolean) => {
        this.setState({
            user: {
                ...this.state.user,
                [type]: value
            }
        });
    };

    showThePassword = () => {
        const { showPassword } = this.state;
        this.setState({ showPassword: !showPassword });
    };

    displayErrorMessage(errorCode: string) {
        switch (errorCode) {
            case 'auth/email-already-in-use':
                return 'Email already in use.';
            case 'auth/invalid-email':
                return 'Invalid email.';
            case 'auth/weak-password':
                return 'Password does not meet criteria.';
            default:
                return errorCode;
        }
    }

    resetState = () => {
        this.setState({
            user: {
                userName: '',
                password: '',
                phoneNumber: '',
                firstName: '',
                lastName: '',
                emailEnabled: true,
                smsEnabled: true,
                pushEnabled: isPlatform('capacitor')
            },
            goHome: false,
            showPassword: false
        });
    };

    goHome = () => {
        this.props.logout();
        this.setState({ goHome: true });
    };

    render() {
        const { user, goHome, showPassword, validationError, dob, gender } = this.state;
        const { loading, participant, authentication, authError, names } = this.props;
        const { isEmpty, isLoaded } = this.props.fireBaseAuth;
        const {
            userName,
            password,
            phoneNumber,
            firstName,
            lastName,
            emailEnabled,
            smsEnabled,
            pushEnabled
        } = user;
        const passwordType = showPassword ? 'text' : 'password';
        const iconDisplayed = showPassword ? eyeOffSharp : eyeSharp;
        const registrationSuccess = authentication ? authentication.registrationSuccess : false;
        const enablePush = isPlatform('capacitor');
        const LoadingIndicator = loading ? <Loading /> : null;

        if (goHome) {
            this.resetState();
            return <Redirect to={routes.LOGIN} />;
        }

        return (
            <IonPage>
                <AppHeader showHeader={true} text={'Register'} />
                {!registrationSuccess && (
                    <IonContent className='ion-padding'>
                        {LoadingIndicator}
                        <p className='hero-text'>
                            To complete registration please enter all of required information.
                        </p>
                        <p className='small-text'>All fields are required</p>
                        <form onSubmit={(e) => this.handleSubmit(e)}>
                            <IonItem>
                                <IonLabel position='stacked'>First Name</IonLabel>
                                <IonInput
                                    id='fname-field'
                                    data-testid='fname-field'
                                    name='firstName'
                                    required={true}
                                    value={firstName}
                                    placeholder='Given Name'
                                    onIonInput={(e) => this.handleChange(e)}
                                />
                            </IonItem>
                            <IonItem>
                                <IonLabel position='stacked'>Last Name</IonLabel>
                                <IonInput
                                    id='lname-field'
                                    data-testid='lname-field'
                                    name='lastName'
                                    required={true}
                                    value={lastName}
                                    placeholder='Surname'
                                    onIonInput={(e) => this.handleChange(e)}
                                />
                            </IonItem>
                            <PhoneNumberMaskInput
                                inputHandler={this.handlePhone}
                                phoneNumber={phoneNumber}
                                value={phoneNumber}
                            />
                            {isEmptyObject(names) && (
                                <>
                                    <DatePicker
                                        label='Date of Birth'
                                        date={dob}
                                        name='dob'
                                        setDate={this.handleDOBChange}
                                        max={new Date().toISOString()}
                                    />
                                    <IonItem>
                                        <IonLabel position='stacked'>Sex</IonLabel>
                                        <IonSelect
                                            data-testid='gender-select'
                                            className='rounded-input'
                                            name={`genderSelect`}
                                            okText='Ok'
                                            cancelText='Cancel'
                                            onIonChange={(e) => this.handleGenderChange(e)}
                                            value={gender}
                                            placeholder={'Select Sex'}>
                                            <IonSelectOption key={'M'} value={'M'}>
                                                Male
                                            </IonSelectOption>
                                            <IonSelectOption key={'F'} value={'F'}>
                                                Female
                                            </IonSelectOption>
                                        </IonSelect>
                                    </IonItem>
                                </>
                            )}
                            <IonItem>
                                <IonLabel position='stacked'>User ID (Email Address)</IonLabel>
                                <IonInput
                                    id='email-field'
                                    data-testid='email-field'
                                    inputMode='email'
                                    name='userName'
                                    required={true}
                                    value={userName}
                                    pattern={`^([a-zA-Z0-9_\\-\\.\\+]+)@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.)|(([a-zA-Z0-9\\-]+\\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\\]?)$`}
                                    placeholder='email@somedomain.com '
                                    onIonInput={(e) => this.handleChange(e)}
                                />
                            </IonItem>
                            <IonItem>
                                <IonLabel position='stacked'>Password</IonLabel>
                                <p className='small-text'>
                                    Must contain 8 characters, at least 1 upper case letter, and at least one
                                    special character or number
                                </p>
                                <IonInput
                                    id='password-field'
                                    data-testid='password-field'
                                    type={passwordType}
                                    name='password'
                                    pattern='(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$'
                                    required={true}
                                    value={password}
                                    onIonInput={(e) => this.handleChange(e)}
                                />
                                <IonIcon
                                    style={{ paddingTop: '13px' }}
                                    icon={iconDisplayed}
                                    slot='end'
                                    onClick={() => this.showThePassword()}
                                    aria-label={'show password icon'}
                                />
                            </IonItem>
                            <IonItem>
                                <IonLabel>Allow Email Notifications</IonLabel>
                                <IonToggle
                                    id='email-checkbox'
                                    data-testid='email-checkbox'
                                    checked={emailEnabled}
                                    onIonChange={(e: any) =>
                                        this.setChecked('emailEnabled', e.detail.checked)
                                    }
                                />
                            </IonItem>
                            <IonItem>
                                <IonLabel>Allow SMS Notifications*</IonLabel>
                                <IonToggle
                                    id='sms-checkbox'
                                    data-testid='sms-checkbox'
                                    checked={smsEnabled}
                                    onIonChange={(e: any) => this.setChecked('smsEnabled', e.detail.checked)}
                                />
                            </IonItem>
                            <IonItem>
                                <IonLabel>Allow Push Notifications</IonLabel>
                                <IonToggle
                                    id='push-checkbox'
                                    data-testid='push-checkbox'
                                    checked={pushEnabled}
                                    disabled={!enablePush}
                                    onIonChange={(e: any) => this.setChecked('pushEnabled', e.detail.checked)}
                                />
                            </IonItem>
                            <p style={{ fontSize: '10px', color: '#007cba' }}>
                                *Message and data rates may apply.
                            </p>
                            {participant && isEmpty && (
                                <IonButton
                                    type='submit'
                                    id='submit-button'
                                    style={{ marginTop: '.5em' }}
                                    expand='block'
                                    color='primary'>
                                    Complete Registration
                                </IonButton>
                            )}
                            {isEmpty && isLoaded && (
                                <IonButton
                                    id='reset-button'
                                    type='button'
                                    onClick={() => {
                                        this.resetState();
                                        this.props.resetparticipantLookup();
                                    }}
                                    routerLink={routes.LOGIN_CARD}
                                    style={{ marginTop: '.5em' }}
                                    expand='block'
                                    fill='solid'
                                    color='light'>
                                    Start Over
                                </IonButton>
                            )}
                            {!participant && isEmpty && (
                                <IonText>
                                    <h2>
                                        Participant information required is not present. Please start
                                        registration process over.
                                    </h2>
                                </IonText>
                            )}
                        </form>
                    </IonContent>
                )}
                {registrationSuccess && (
                    <IonContent className='ion-padding'>
                        <p className='hero-text'>Registration Success!</p>
                        <p className='small-text'>
                            You must verify your email to login. Check your email for a link."
                        </p>
                        <img src={images.ONE_STEP} alt='Verify your email address.' />
                    </IonContent>
                )}
                <IonToast
                    id='registration-success-toast'
                    isOpen={registrationSuccess ? registrationSuccess : false}
                    color={'success'}
                    message='Registration Successful. You must verify your email to login. Check your email for a link.'
                    buttons={[
                        {
                            text: 'Okay',
                            role: 'cancel',
                            handler: () => {
                                this.goHome();
                            }
                        }
                    ]}
                />
                <IonToast
                    id='validation-error-toast'
                    isOpen={validationError.error}
                    color={'danger'}
                    duration={2000}
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
                <IonToast
                    id='registration-failed-toast'
                    isOpen={isEmpty && !isEmptyObject(authError)}
                    onDidDismiss={() => this.props.clearAuthError()}
                    duration={2000}
                    color={'danger'}
                    message={
                        authentication.errorCode
                            ? this.displayErrorMessage(authentication.errorCode)
                            : 'Registration Failed, please try again or contact your system administrator.'
                    }
                    buttons={[
                        {
                            text: 'Okay',
                            role: 'cancel'
                        }
                    ]}
                />
            </IonPage>
        );
    }
}

export default Register;
