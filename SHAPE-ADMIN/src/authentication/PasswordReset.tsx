import React, {Component, SyntheticEvent} from 'react';
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
import {resetPassword} from '../redux/actions/Authentication';
import {connect} from 'react-redux';
import {routes} from '../utils/Constants';

interface PassedProps {
    resetPassword: Function;
    isLoading: boolean;
    authError: string;
}

interface State {
    user: {
        userName: string;
    };
    name: string;
    value: string;
    emailSent: boolean;
}

class PasswordReset extends Component<PassedProps, State> {
    constructor(props: any) {
        super(props);
        this.state = {
            user: {
                userName: ''
            },
            name: '',
            value: '',
            emailSent: false
        };
    }

    handleSubmit = (e: SyntheticEvent) => {
        e.preventDefault();
        const {user} = this.state;
        this.props.resetPassword(user);
        this.setState({emailSent: true});
    };

    handleChange(event: any) {
        const {name, value} = event.target;
        const {user} = this.state;
        this.setState({
            user: {
                ...user,
                [name]: value
            }
        });
    }

    render() {
        const {isLoading, authError} = this.props;
        const {emailSent} = this.state;
        const LoadingIndicator = isLoading ? <Loading /> : null;

        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonItem slot="start">
                            <img
                                alt="shape-logo"
                                src="/assets/icon/SHAPE_logo.png"
                                width="64px"
                                height="64px"
                            />
                        </IonItem>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding">
                    {LoadingIndicator}
                    <IonText>
                        <h3>
                            Enter your email address registered with this
                            application.
                        </h3>
                    </IonText>
                    <form onSubmit={(e) => this.handleSubmit(e)}>
                        <IonItem>
                            <IonLabel position="floating">
                                User ID (Email Address)
                            </IonLabel>
                            <IonInput
                                inputMode="email"
                                name="userName"
                                required={true}
                                onIonInput={(e) =>
                                    this.handleChange(e)
                                }></IonInput>
                        </IonItem>
                        <IonButton
                            type="submit"
                            id="submit"
                            style={{marginTop: '.5em'}}
                            expand="block"
                            color="primary">
                            Reset Password
                        </IonButton>
                    </form>
                    {emailSent && !authError && (
                        <span>
                            <IonText color="secondary">
                                <h3>
                                    An email has been sent to the registered
                                    email address to reset your password.
                                </h3>
                            </IonText>
                        </span>
                    )}
                    {authError && (
                        <span>
                            <IonText color="danger">
                                <h3>Password Reset failed. {authError}</h3>
                            </IonText>
                        </span>
                    )}
                    <IonButton
                        routerLink={routes.LOGIN}
                        id="submit"
                        style={{marginTop: '.5em'}}
                        expand="block"
                        fill="outline"
                        color="primary">
                        Home
                    </IonButton>
                </IonContent>
            </IonPage>
        );
    }
}

const mapStateToProps = (state: any) => ({
    isLoading: state.loading,
    authError: state.authentication.authError
});

const mapDispatchToProps = (dispatch: any) => ({
    resetPassword(user: any) {
        dispatch(resetPassword(user));
    }
});

// Connected Component
export default connect(mapStateToProps, mapDispatchToProps)(PasswordReset);
