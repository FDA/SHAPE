import React, { Component } from 'react';
import { IonButton, IonFooter, IonAlert, IonToolbar } from '@ionic/react';
import { RouteComponentProps, withRouter } from 'react-router';

interface PassedProps extends RouteComponentProps {
    resetPassword: Function;
    show: boolean;
    logout: Function;
}

interface PreferenceButtonsState {
    showResetPassword: boolean;
}

class PreferenceButtons extends Component<PassedProps, PreferenceButtonsState> {
    constructor(props: PassedProps) {
        super(props);
        this.state = {
            showResetPassword: false
        };
    }

    resetPassword = () => {
        this.props.resetPassword();
        setTimeout(() => {
            this.setState({ showResetPassword: true });
        }, 1000);
    };

    render() {
        const { show } = this.props;
        return (
            <IonFooter hidden={!show} className='ion-no-border'>
                <IonToolbar>
                    <IonButton
                        type='button'
                        onClick={() => {
                            this.resetPassword();
                        }}
                        expand='block'
                        fill='solid'
                        color='light'>
                        Reset Password
                    </IonButton>
                    <IonButton id='logout' fill='solid' expand='block' onClick={() => this.props.logout()}>
                        Logout
                    </IonButton>
                    <IonAlert
                        aria-label={'password reset success message'}
                        isOpen={this.state.showResetPassword}
                        onDidDismiss={() => this.setState({ showResetPassword: false })}
                        header={'Password Reset Request Sent'}
                        message={'Check your email for a link to reset your password.'}
                        buttons={[
                            {
                                text: 'OK'
                            }
                        ]}
                    />
                </IonToolbar>
            </IonFooter>
        );
    }
}

export default withRouter(PreferenceButtons);
