import React, { Component, SyntheticEvent } from "react";
import Loading from "../layout/Loading";
import {
  IonButton,
  IonCheckbox,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonText,
  IonToast,
  isPlatform,
} from "@ionic/react";
import AppHeader from "../layout/AppHeader";
import { Redirect } from "react-router";
import { eyeOffSharp, eyeSharp } from "ionicons/icons";
import PhoneNumberMaskInput from "../components/PhoneNumberMaskInput";
import {
  Participant,
  Person,
  AuthenticationObject,
  FirebaseAuth,
  RegisteringUserWithPassword,
} from "../../interfaces/DataTypes";
import { isEmptyObject } from "../../utils/Utils";
import { environments, routes, images } from "../../utils/Constants";

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
}

interface RegisterState {
  user: RegisteringUserWithPassword;
  validationError: Error;
  showPassword: boolean;
  goHome: boolean;
}

class Register extends Component<PassedProps, RegisterState> {
  constructor(props: PassedProps) {
    super(props);
    this.state = {
      user: {
        userName: "",
        password: "",
        phoneNumber: "",
        firstName: "",
        lastName: "",
        emailEnabled: true,
        smsEnabled: true,
        pushEnabled: isPlatform("capacitor"),
      },
      goHome: false,
      validationError: {
        error: false,
        message: "",
      },
      showPassword: false,
    };
    this.handlePhone = this.handlePhone.bind(this);
  }

  handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    const { user } = this.state;
    const { participant, names } = this.props;
    const userToCreate = { ...user, ...participant, profiles: names };
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (phoneRegex.test(user.phoneNumber)) {
      const formattedPhoneNumber = user.phoneNumber.replace(
        phoneRegex,
        "$1-$2-$3"
      );
      user.phoneNumber = formattedPhoneNumber;
      if (process.env.NODE_ENV === environments.DEVELOPMENT)
        console.log(
          `Trying to register user: ${JSON.stringify(userToCreate)} `
        );
      this.props.toggleLoading(true);
      this.props.register(userToCreate);
    } else {
      this.setState({
        validationError: {
          error: true,
          message: "Please enter a valid phone number",
        },
      });
    }
  };

  handlePhone = (phone: string) => {
    const { user } = this.state;
    this.setState({
      user: {
        ...user,
        phoneNumber: phone,
      },
    });
  };

  handleChange = (event: CustomEvent<KeyboardEvent>) => {
    const { name, value } = event.target as HTMLInputElement;
    const { user } = this.state;
    this.setState({
      user: {
        ...user,
        [name]: value,
      },
    });
  };

  setChecked = (type: string, value: boolean) => {
    this.setState({
      user: {
        ...this.state.user,
        [type]: value,
      },
    });
  };

  showThePassword = () => {
    const { showPassword } = this.state;
    this.setState({ showPassword: !showPassword });
  };

  resetState = () => {
    this.setState({
      user: {
        userName: "",
        password: "",
        phoneNumber: "",
        firstName: "",
        lastName: "",
        emailEnabled: true,
        smsEnabled: true,
        pushEnabled: isPlatform("capacitor"),
      },
      goHome: false,
      showPassword: false,
    });
  };

  goHome = () => {
    this.props.logout();
    this.setState({ goHome: true });
  };

  render() {
    let { user, goHome, showPassword, validationError } = this.state;
    const {
      userName,
      password,
      phoneNumber,
      firstName,
      lastName,
      emailEnabled,
      smsEnabled,
      pushEnabled,
    } = user;

    const passwordType = showPassword ? "text" : "password";
    const iconDisplayed = showPassword ? eyeOffSharp : eyeSharp;

    const { loading, participant, authentication, authError } = this.props;
    const registrationSuccess = authentication
      ? authentication.registrationSuccess
      : false;
    const { isEmpty, isLoaded } = this.props.fireBaseAuth;
    const isParticipantPresent = participant;
    const LoadingIndicator = loading ? <Loading /> : null;
    if (goHome) {
      return <Redirect to={routes.LOGIN} />;
    }
    const enablePush = isPlatform("capacitor");
    return (
      <IonPage>
        <AppHeader showHeader={true} text={"Register"} />
        {!registrationSuccess && (
          <IonContent className="ion-padding">
            {LoadingIndicator}
            <p className="hero-text">
              To complete registration please enter all of required information.
            </p>
            <p className="small-text">All fields are required</p>
            <form onSubmit={(e) => this.handleSubmit(e)}>
              <IonItem>
                <IonLabel position="stacked">First Name</IonLabel>
                <IonInput
                  id="fname-field"
                  data-testid="fname-field"
                  name="firstName"
                  required={true}
                  value={firstName}
                  autofocus={true}
                  placeholder="Given Name"
                  onIonInput={(e) => this.handleChange(e)}
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Last Name</IonLabel>
                <IonInput
                  id="lname-field"
                  data-testid="lname-field"
                  name="lastName"
                  required={true}
                  value={lastName}
                  placeholder="Surname"
                  onIonInput={(e) => this.handleChange(e)}
                />
              </IonItem>
              <PhoneNumberMaskInput
                inputHandler={this.handlePhone}
                phoneNumber={phoneNumber}
                value={phoneNumber}
              />
              <IonItem>
                <IonLabel position="stacked">User ID (Email Address)</IonLabel>
                <IonInput
                  id="email-field"
                  data-testid="email-field"
                  inputMode="email"
                  name="userName"
                  required={true}
                  value={userName}
                  pattern={`^([a-zA-Z0-9_\\-\\.\\+]+)@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.)|(([a-zA-Z0-9\\-]+\\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\\]?)$`}
                  placeholder="email@somedomain.com "
                  onIonInput={(e) => this.handleChange(e)}
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Password</IonLabel>
                <p className="small-text">
                  Must contain 8 characters, at least 1 upper case letter, and
                  at least one special character or number
                </p>
                <IonInput
                  id="password-field"
                  data-testid="password-field"
                  type={passwordType}
                  name="password"
                  pattern="(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$"
                  required={true}
                  value={password}
                  onIonInput={(e) => this.handleChange(e)}
                />
                <IonIcon
                  style={{ paddingTop: "13px" }}
                  icon={iconDisplayed}
                  slot="end"
                  onClick={() => this.showThePassword()}
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">
                  Allow Email Notifications
                </IonLabel>
                <IonCheckbox
                  id="email-checkbox"
                  data-testid="email-checkbox"
                  checked={emailEnabled}
                  onIonChange={(e) =>
                    this.setChecked("emailEnabled", e.detail.checked)
                  }
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Allow SMS Notifications</IonLabel>
                <p style={{ fontSize: "10px", color: "lightgrey" }}>
                  *Message and data rates may apply.
                </p>
                <IonCheckbox
                  id="sms-checkbox"
                  data-testid="sms-checkbox"
                  checked={smsEnabled}
                  onIonChange={(e) =>
                    this.setChecked("smsEnabled", e.detail.checked)
                  }
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Allow Push Notifications</IonLabel>
                <IonCheckbox
                  id="push-checkbox"
                  data-testid="push-checkbox"
                  checked={pushEnabled}
                  disabled={!enablePush}
                  onIonChange={(e) =>
                    this.setChecked("pushEnabled", e.detail.checked)
                  }
                />
              </IonItem>

              {isEmpty && isLoaded && (
                <IonButton
                  id="reset-button"
                  type="button"
                  onClick={(e) => {
                    this.props.resetparticipantLookup();
                  }}
                  routerLink={routes.LOGIN_CARD}
                  style={{ marginTop: ".5em" }}
                  expand="block"
                  fill="solid"
                  color="light"
                >
                  Start Over
                </IonButton>
              )}
              {isParticipantPresent && isEmpty && (
                <IonButton
                  type="submit"
                  id="submit-button"
                  style={{ marginTop: ".5em" }}
                  expand="block"
                  color="primary"
                >
                  Complete Registration
                </IonButton>
              )}
              {!isParticipantPresent && isEmpty && (
                <IonText>
                  <h2>
                    Participant information reqired is not present. Please start
                    registration process over.
                  </h2>
                </IonText>
              )}
            </form>
          </IonContent>
        )}
        {registrationSuccess && (
          <IonContent className="ion-padding">
            <p className="hero-text">Registration Success!</p>
            <p className="small-text">
              You must verify your email to login. Check your email for a link."
            </p>
            <img src={images.ONE_STEP} alt="Verify your email address." />
          </IonContent>
        )}
        <IonToast
          id="registration-success-toast"
          isOpen={registrationSuccess ? registrationSuccess : false}
          color={"success"}
          message="Registration Successful. You must verify your email to login. Check your email for a link."
          buttons={[
            {
              text: "Okay",
              role: "cancel",
              handler: () => {
                this.goHome();
              },
            },
          ]}
        />
        <IonToast
          id="validation-error-toast"
          isOpen={validationError.error}
          color={"danger"}
          message={validationError.message}
          buttons={[
            {
              text: "Okay",
              role: "cancel",
              handler: () => {
                this.setState({
                  validationError: { error: false, message: "" },
                });
              },
            },
          ]}
        />

        <IonToast
          id="registration-failed-toast"
          isOpen={isEmpty && !isEmptyObject(authError)}
          color={"danger"}
          message="Registration Failed, please try again or contact your system administrator."
          buttons={[
            {
              text: "Okay",
              role: "cancel",
            },
          ]}
        />
      </IonPage>
    );
  }
}

export default Register;
