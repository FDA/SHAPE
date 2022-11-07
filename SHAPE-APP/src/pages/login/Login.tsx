import React, { Component, SyntheticEvent } from 'react';
import { Redirect } from 'react-router-dom';
import { Toast, ButtonBar } from './components';
import {
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonPage,
    IonText,
    IonToolbar
} from '@ionic/react';
import Loading from '../layout/Loading';
import { Account, FirebaseAuth, AuthenticationObject } from '../../interfaces/DataTypes';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { routes, images } from '../../utils/Constants';
import { isEmptyObject } from '../../utils/Utils';

interface State {
    user: Account;
    name: string;
    value: string;
    redirectToHome: boolean;
    showPassword: boolean;
}

interface PassedProps {
    authentication: Function;
    resetUserState: Function;
    isLoading: boolean;
    darkMode: boolean;
    fireBaseAuth: FirebaseAuth;
    passwordChangeSuccess: boolean;
    passwordResetSuccess: boolean;
    emailVerificationResendSuccess: boolean;
    emailVerificationSuccess: boolean;
    auth: AuthenticationObject;
}

class Login extends Component<PassedProps, State> {
    constructor(props: PassedProps) {
        super(props);
        this.state = {
            user: {
                userName: '',
                password: ''
            },
            name: '',
            value: '',
            redirectToHome: false,
            showPassword: false
        };
    }

    handleSubmit = (e: SyntheticEvent) => {
        e.preventDefault();
        const { user } = this.state;
        this.props.authentication(user);
    };

    goHome = () => {
        this.setState({
            redirectToHome: true
        });
    };

    resetError = () => {
        this.props.resetUserState();
    };

    handleChange(event: any) {
        const { name, value } = event.target;
        const { user } = this.state;
        this.setState({
            user: {
                ...user,
                [name]: value
            }
        });
    }

    showThePassword = () => {
        const { showPassword } = this.state;
        this.setState({ showPassword: !showPassword });
    };

    render() {
        if (this.state.redirectToHome) return <Redirect to={routes.TABS} />;
        const { showPassword } = this.state;
        const passwordType = showPassword ? 'text' : 'password';
        const iconDisplayed = showPassword ? eyeOffOutline : eyeOutline;
        const {
            isLoading,
            darkMode,
            auth,
            passwordChangeSuccess,
            passwordResetSuccess,
            emailVerificationResendSuccess,
            emailVerificationSuccess
        } = this.props;
        const { authError } = auth;
        const logo = darkMode ? images.SHAPE_LOGO_HORIZONTAL_DARKMODE : images.SHAPE_LOGO_HORIZONTAL;
        const { isEmpty } = this.props.fireBaseAuth;

        const LoadingIndicator = isLoading ? <Loading /> : null;
        return (
            <IonPage style={{ textAlign: 'center' }}>
                <IonHeader>
                    <IonToolbar>
                        <IonItem slot='start'>
                            <img src={logo} alt='Shape Logo' />
                        </IonItem>
                    </IonToolbar>
                </IonHeader>
                <IonContent className='ion-padding'>
                    {LoadingIndicator}
                    {isEmpty && (
                        <div>
                            <IonText>
                                <h3>To login to the site enter your email address and password.</h3>
                            </IonText>
                            <form onSubmit={(e) => this.handleSubmit(e)}>
                                <IonItem>
                                    <IonLabel position='stacked'>User ID</IonLabel>
                                    <IonInput
                                        inputMode='email'
                                        name='userName'
                                        required={true}
                                        onIonInput={(e) => this.handleChange(e)}
                                    />
                                </IonItem>
                                <IonItem>
                                    <IonLabel position='stacked'>Password</IonLabel>
                                    <IonInput
                                        type={passwordType}
                                        name='password'
                                        pattern='(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$'
                                        required={true}
                                        onIonInput={(e) => this.handleChange(e)}
                                    />
                                    <IonIcon
                                        aria-label={'show password icon'}
                                        style={{ paddingTop: '13px' }}
                                        icon={iconDisplayed}
                                        slot='end'
                                        onClick={() => this.showThePassword()}
                                    />
                                </IonItem>
                                <ButtonBar />
                            </form>
                            <Toast
                                isOpen={!isEmptyObject(authError)}
                                onDidDismiss={this.resetError}
                                message={authError ? authError : ''}
                                color={'danger'}
                            />
                            <Toast
                                isOpen={passwordChangeSuccess}
                                color={'success'}
                                message={'Password changed successfully.'}
                                onDidDismiss={this.resetError}
                            />
                            <Toast
                                isOpen={passwordResetSuccess}
                                color={'success'}
                                message={'Password reset email sent successfully.'}
                                onDidDismiss={this.resetError}
                            />
                            <Toast
                                isOpen={emailVerificationResendSuccess}
                                color={'success'}
                                message={'Verification email successfully sent.'}
                                onDidDismiss={this.resetError}
                            />
                            <Toast
                                isOpen={emailVerificationSuccess}
                                color={'success'}
                                message={'Email successfully verified.'}
                                onDidDismiss={this.resetError}
                            />
                        </div>
                    )}
                    {!isEmpty ? (
                        <span>
                            <img
                                src={images.LOGIN_LANDING}
                                alt='Login success'
                                style={{ marginTop: '2em' }}
                            />
                            <Toast
                                isOpen={true}
                                onDidDismiss={this.goHome}
                                message={'Login Successful, loading surveys...'}
                                color={'success'}
                            />
                            <IonText>Login Success!</IonText>
                        </span>
                    ) : null}
                </IonContent>
            </IonPage>
        );
    }
}

export default Login;
