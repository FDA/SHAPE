import React, { Component } from "react";
import { IonButton, IonFooter, IonToolbar, IonAlert } from "@ionic/react";
import { RouteComponentProps, withRouter } from "react-router";
import { routes } from "../../../utils/Constants";

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
      showResetPassword: false,
    };
  }

  redirectToWithdrawal = () => {
    this.props.history.push(`${routes.NEW_DIARY_ENTRY}?type=withdrawal`);
  };

  resetPassword = () => {
    this.setState({ showResetPassword: true });
    this.props.resetPassword();
  };

  render() {
    const { show } = this.props;
    if (!show) {
      return null;
    }
    return (
      <>
        <IonFooter className="ion-no-border">
          <IonToolbar>
            <IonButton
              type="button"
              expand="block"
              onClick={() => this.redirectToWithdrawal()}
              fill="solid"
              color="danger"
            >
              Deactivate Account
            </IonButton>
            <IonButton
              type="button"
              onClick={() => {
                this.resetPassword();
              }}
              expand="block"
              fill="solid"
              color="light"
            >
              Reset Password
            </IonButton>
            <IonButton
              id="logout"
              fill="solid"
              expand="block"
              onClick={() => this.props.logout()}
            >
              Logout
            </IonButton>
          </IonToolbar>
          <IonAlert
            isOpen={this.state.showResetPassword}
            onDidDismiss={() => this.setState({ showResetPassword: false })}
            header={"Password Reset Request Sent"}
            message={"Check your email for a link to reset your password."}
            buttons={[
              {
                text: "OK",
              },
            ]}
          />
        </IonFooter>
      </>
    );
  }
}

export default withRouter(PreferenceButtons);
