import React, {Component, SyntheticEvent} from 'react';
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
import {Redirect} from 'react-router-dom';
import {User} from '../interfaces/DataTypes';
import {connect} from 'react-redux';
import {authentication} from '../redux/actions/Authentication';
import Loading from '../layout/Loading';
import {images, routes} from '../utils/Constants';

interface State {
    user: {
        userName: string;
        password: string;
    };
    name: string;
    value: string;
}

interface Props {
    authenticationDispatch: Function;
    isLoading: boolean;
    authError: string;
    loggedIn: boolean;
}

class Login extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            user: {
                userName: '',
                password: ''
            },
            name: '',
            value: ''
        };
    }

    handleSubmit = (e: SyntheticEvent) => {
        e.preventDefault();
        const {user} = this.state;
        this.props.authenticationDispatch(user);
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
        const {isLoading, authError, loggedIn} = this.props;

        const LoadingIndicator = isLoading ? <Loading /> : null;
        if (!loggedIn)
            return (
                <IonPage>
                    <IonHeader>
                        <IonToolbar>
                            <IonItem slot="start">
                                <img
                                    alt="shape-logo"
                                    src={images.SHAPE_LOGO_HORIZONTAL}
                                    height="64px"
                                />
                            </IonItem>
                        </IonToolbar>
                    </IonHeader>
                    <IonContent className="ion-padding">
                        {LoadingIndicator}
                        {!loggedIn && (
                            <span>
                                <IonText>
                                    <h3>
                                        To login to the site enter your email
                                        address and password.
                                    </h3>
                                </IonText>
                                <form
                                    onSubmit={(e) => {
                                        this.handleSubmit(e);
                                    }}>
                                    <IonItem>
                                        <IonLabel position="floating">
                                            User ID
                                        </IonLabel>
                                        <IonInput
                                            inputMode="email"
                                            name="userName"
                                            required={true}
                                            onIonInput={(e) =>
                                                this.handleChange(e)
                                            }
                                        />
                                    </IonItem>
                                    <IonItem>
                                        <IonLabel position="floating">
                                            Password
                                        </IonLabel>
                                        <IonInput
                                            type="password"
                                            name="password"
                                            pattern="password"
                                            required={true}
                                            onIonInput={(e) =>
                                                this.handleChange(e)
                                            }
                                        />
                                    </IonItem>

                                    <span>
                                        <IonButton
                                            onClick={(e) =>
                                                this.handleSubmit(e)
                                            }
                                            type="submit"
                                            id="submit"
                                            style={{marginTop: '.5em'}}
                                            expand="block"
                                            color="primary">
                                            Login
                                        </IonButton>
                                        <IonButton
                                            type="button"
                                            routerLink={routes.HOME}
                                            style={{marginTop: '.5em'}}
                                            expand="block"
                                            fill="outline"
                                            color="primary">
                                            Cancel
                                        </IonButton>
                                        <IonButton
                                            type="button"
                                            routerLink={routes.PASSWORD_RESET}
                                            style={{marginTop: '2.5em'}}
                                            expand="block"
                                            fill="outline"
                                            color="primary">
                                            Forgot Password?
                                        </IonButton>
                                    </span>
                                </form>
                            </span>
                        )}
                        {!loggedIn && authError ? (
                            <IonText color="danger">
                                <h3>Login Failed</h3>
                            </IonText>
                        ) : null}
                    </IonContent>
                </IonPage>
            );
        else return <Redirect to={routes.HOME} />;
    }
}

const mapStateToProps = (state: any) => ({
    loggedIn: state.authentication.loggedIn,
    isLoading: state.loading,
    authError: state.authentication.authError
});

const mapDispatchToProps = (dispatch: {
    (arg0: (dispatch: any, getStates: any, getFirebase: any) => void): void;
    (arg0: (dispatch: any, getStates: any, getFirebase: any) => void): void;
}) => ({
    authenticationDispatch(user: User) {
        dispatch(authentication(user));
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
