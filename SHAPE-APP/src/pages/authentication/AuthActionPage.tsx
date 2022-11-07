import React, { Component, SyntheticEvent } from 'react';
import Loading from '../layout/Loading';
import {
    IonButton,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonPage,
    IonText,
    IonToolbar
} from '@ionic/react';
import { isEmptyObject } from '../../utils/Utils';
import { environments, images, routes } from '../../utils/Constants';
import { Redirect, RouteComponentProps } from 'react-router-dom';

const modes = {
    RESETPASSWORD: 'resetPassword',
    VERIFYEMAIL: 'verifyEmail'
};

interface PassedProps extends RouteComponentProps {
    validateThenResetPassword: Function;
    isLoading: boolean;
    authError: string;
    darkMode: boolean;
    verifyEmail: Function;
    passwordChangeSuccess: boolean;
}

interface AuthActionPageState {
    password: string;
}

class AuthActionPage extends Component<PassedProps, AuthActionPageState> {
    constructor(props: PassedProps) {
        super(props);
        this.state = {
            password: ''
        };
    }

    handleSubmit = (e: SyntheticEvent, code: string) => {
        e.preventDefault();
        const { password } = this.state;
        this.props.validateThenResetPassword(code, password);
        this.setState({ password: '' });
    };

    handleChange = (event: CustomEvent<InputEvent>) => {
        const { value } = event.target as HTMLInputElement;
        this.setState({
            password: value
        });
    };

    urlParams = () => {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const mode = urlParams.get('mode');
        const oobCode: string = !isEmptyObject(urlParams.get('oobCode')) ? urlParams.get('oobCode')! : '';
        return { mode: mode, oobCode: oobCode };
    };

    render() {
        const { isLoading, authError, darkMode } = this.props;
        const { password } = this.state;
        const LoadingIndicator = isLoading ? <Loading /> : null;
        const { mode, oobCode } = this.urlParams();

        const logo = darkMode ? images.SHAPE_LOGO_HORIZONTAL_DARKMODE : images.SHAPE_LOGO_HORIZONTAL;

        if (process.env.NODE_ENV === environments.DEVELOPMENT) console.log(`mode: ${mode} code: ${oobCode}`);

        if (this.props.passwordChangeSuccess) {
            return <Redirect to={routes.LOGIN} />;
        }
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonItem slot='start'>
                            <img src={logo} alt='logo' />
                        </IonItem>
                    </IonToolbar>
                </IonHeader>
                <IonContent className='ion-padding'>
                    {LoadingIndicator}

                    {mode === modes.RESETPASSWORD && (
                        <>
                            <IonText>
                                <h3>New Password.</h3>
                            </IonText>
                            <form onSubmit={(e) => this.handleSubmit(e, oobCode)}>
                                <IonItem>
                                    <IonLabel position='stacked'>Password</IonLabel>
                                    <p className='small-text'>
                                        Must contain 8 characters, at least 1 upper case letter, and at least
                                        1 special character or number
                                    </p>
                                    <IonInput
                                        id='password-field'
                                        data-testid='password-field'
                                        type='password'
                                        name='password'
                                        pattern='(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$'
                                        required={true}
                                        value={password}
                                        onIonInput={(e) => this.handleChange(e)}
                                    />
                                </IonItem>
                                <IonButton
                                    type='submit'
                                    id='reset-password-button-2'
                                    style={{ marginTop: '.5em' }}
                                    expand='block'
                                    color='primary'>
                                    Reset Password
                                </IonButton>
                            </form>
                            <IonButton
                                href={routes.HOME}
                                style={{ marginTop: '.5em' }}
                                expand='block'
                                fill='outline'
                                color='primary'>
                                Home
                            </IonButton>
                            {authError && (
                                <span>
                                    <IonText color='danger'>
                                        <h3>Password Reset failed. {authError}</h3>
                                    </IonText>
                                </span>
                            )}
                        </>
                    )}

                    {mode === modes.VERIFYEMAIL && (
                        <div>
                            <IonButton
                                id='verify-email-button'
                                style={{ marginTop: '.5em' }}
                                expand='block'
                                color='primary'
                                onClick={() => {
                                    this.props.verifyEmail(oobCode);
                                    this.props.history.push(routes.LOGIN);
                                }}>
                                Verify Email
                            </IonButton>
                            <IonButton
                                href={routes.HOME}
                                style={{ marginTop: '.5em' }}
                                expand='block'
                                fill='outline'
                                color='primary'>
                                Home
                            </IonButton>
                        </div>
                    )}
                </IonContent>
            </IonPage>
        );
    }
}

// Connected Component
export default AuthActionPage;
