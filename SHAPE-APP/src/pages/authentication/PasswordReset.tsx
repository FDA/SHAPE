import React, { Component, SyntheticEvent } from "react";
import Loading from "../layout/Loading";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonText,
  IonToolbar,
} from "@ionic/react";
import { RouteComponentProps } from "react-router-dom";
import { routes, images } from "../../utils/Constants";

interface PassedProps extends RouteComponentProps {
  resetPassword: Function;
  isLoading: boolean;
  authError: string;
}

interface PasswordResetState {
  userName: string;
}

class PasswordReset extends Component<PassedProps, PasswordResetState> {
  constructor(props: PassedProps) {
    super(props);
    this.state = {
      userName: "",
    };
  }

  handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    const { userName } = this.state;
    this.props.resetPassword(userName);
    this.props.history.push(routes.LOGIN);
  };

  handleChange(event: CustomEvent<KeyboardEvent>) {
    const { value } = event.target as HTMLInputElement;
    this.setState({
      userName: value,
    });
  }

  render() {
    const { isLoading, authError } = this.props;
    const LoadingIndicator = isLoading ? <Loading /> : null;

    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonItem slot="start">
              <img src={images.SHAPE_LOGO_HORIZONTAL} alt="logo" />
            </IonItem>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          {LoadingIndicator}
          <IonText>
            <h3>Enter your email address registered with this application.</h3>
          </IonText>
          <form onSubmit={(e) => this.handleSubmit(e)}>
            <IonItem>
              <IonLabel position="floating">User ID (Email Address)</IonLabel>
              <IonInput
                data-testid="email-input"
                inputMode="email"
                name="userName"
                required={true}
                onIonInput={(e) => this.handleChange(e)}
              ></IonInput>
            </IonItem>
            {!authError && (
              <div>
                <IonButton
                  data-testid="reset-button"
                  type="submit"
                  id="submit"
                  style={{ marginTop: ".5em" }}
                  expand="block"
                  color="primary"
                >
                  Reset Password
                </IonButton>
                <IonButton
                  data-testid="cancel-button"
                  type="button"
                  href={routes.HOME}
                  style={{ marginTop: ".5em" }}
                  expand="block"
                  fill="outline"
                  color="primary"
                >
                  Cancel
                </IonButton>
              </div>
            )}
          </form>
        </IonContent>
      </IonPage>
    );
  }
}

// Connected Component
export default PasswordReset;
