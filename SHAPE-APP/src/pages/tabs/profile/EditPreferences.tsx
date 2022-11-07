import React, { Component } from 'react';
import { IonItem, IonLabel, IonList, IonToggle } from '@ionic/react';
import { RegisteringUser } from '../../../interfaces/DataTypes';
import { routes } from '../../../utils/Constants';
import { RouteComponentProps, withRouter } from 'react-router';

interface PassedProps extends RouteComponentProps {
    setChecked: Function;
    handleSubmit: Function;
    user: RegisteringUser;
    show: boolean;
    resetPassword: Function;
    logout: Function;
}

class EditPreferences extends Component<PassedProps, {}> {
    changeSelect = (event: string, flag: boolean, e: any) => {
        this.props.setChecked(event, flag);
        this.props.handleSubmit(e);
    };

    redirectToWithdrawal = () => {
        this.props.history.push(`${routes.NEW_DIARY_ENTRY}?type=withdrawal`);
    };

    render() {
        const { user, show } = this.props;
        return (
            <IonList hidden={!show}>
                <IonItem lines='full'>
                    <IonLabel style={{ padding: '4px' }}>Allow Email Notifications</IonLabel>
                    <IonToggle
                        checked={user.emailEnabled}
                        slot='end'
                        onIonChange={(e: any) => this.changeSelect('emailEnabled', e.detail.checked, e)}
                    />
                </IonItem>

                <IonItem lines='full'>
                    <IonLabel style={{ padding: '4px' }}>Allow Push Notifications</IonLabel>
                    <IonToggle
                        checked={user.pushEnabled}
                        slot='end'
                        onIonChange={(e: any) => this.changeSelect('pushEnabled', e.detail.checked, e)}
                    />
                </IonItem>
                <IonItem lines='full'>
                    <IonLabel style={{ padding: '4px' }}>
                        Allow SMS Notifications
                        <br />
                        <span style={{ fontSize: '10px', color: '#007cba' }}>
                            *Msg and data rates may apply.
                        </span>
                    </IonLabel>
                    <IonToggle
                        checked={user.smsEnabled}
                        slot='end'
                        onIonChange={(e: any) => this.changeSelect('smsEnabled', e.detail.checked, e)}
                    />
                </IonItem>
                <IonItem lines='full' onClick={() => this.redirectToWithdrawal()}>
                    <IonLabel style={{ padding: '4px' }} color='danger'>
                        Deactivate Account
                    </IonLabel>
                </IonItem>
            </IonList>
        );
    }
}

export default withRouter(EditPreferences);
