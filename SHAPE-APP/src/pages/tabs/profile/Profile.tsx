import React, { Component } from "react";
import {
  IonContent,
  IonIcon,
  IonLabel,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonToast,
} from "@ionic/react";
import AppHeader from "../../layout/AppHeader";
import { Redirect } from "react-router";
import EditPreferences from "./EditPreferences";
import ProfileEditSave from "./ProfileEditSave";
import PreferenceButtons from "./PreferenceButtons";
import EditParticipant from "./EditParticipant";
import ViewProfile from "./ViewProfile";
import EditProfile from "./EditProfile";
import { registerForPush } from "../../../utils/Utils";
import Loading from "../../layout/Loading";
import { informationCircleSharp } from "ionicons/icons";
import build from "../../../build-info.json";
import {
  User,
  RegisteringUser,
  FirebaseAuth,
} from "../../../interfaces/DataTypes";
import { routes } from "../../../utils/Constants";

interface PassedProps {
  logout: Function;
  profile: User;
  fireBaseAuth: FirebaseAuth;
  resetEHR: Function;
  resetPassword: Function;
  updateParticipantDeviceToken: Function;
  updateParticipant: Function;
  isLoading: boolean;
}

interface ProfileState {
  editing: boolean;
  user: RegisteringUser;
  name: string;
  value: string;
  segment: string;
  goHome: boolean;
  validationError: {
    error: boolean;
    message: string;
  };
}

const segments = {
  RESPONDENT: "respondent",
  PARTICIPANT: "participant",
  PREFERENCES: "preferences",
};

class Profile extends Component<PassedProps, ProfileState> {
  constructor(props: PassedProps) {
    super(props);
    this.state = {
      editing: false,
      user: {
        userName: "",
        phoneNumber: "",
        firstName: "",
        lastName: "",
        emailEnabled: false,
        smsEnabled: false,
        pushEnabled: false,
      },
      name: "",
      value: "",
      segment: "respondent",
      goHome: false,
      validationError: {
        error: false,
        message: "",
      },
    };
    this.toggleEdit = this.toggleEdit.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.setChecked = this.setChecked.bind(this);
    this.logout = this.logout.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
    this.handlePhone = this.handlePhone.bind(this);
  }

  logout = () => {
    this.props.logout();
    this.setState({ goHome: true });
  };
  load = () => {
    let { profile, fireBaseAuth } = this.props;

    this.setState({
      user: {
        ...this.state.user,
        firstName: profile.firstName,
        lastName: profile.lastName,
        phoneNumber: profile.phoneNumber,
        userName: fireBaseAuth.email,
        emailEnabled: profile.emailEnabled,
        smsEnabled: profile.smsEnabled,
        pushEnabled: profile.pushEnabled,
      },
      goHome: false,
    });
  };
  setChecked = (type: string, value: boolean) => {
    if (type !== undefined && value !== undefined) {
      this.setState({
        user: {
          ...this.state.user,
          [type]: value,
        },
      });
    }
  };

  UNSAFE_componentWillMount() {
    this.props.resetEHR();
    this.load();
  }

  setSegment = (segment: string) => {
    this.setState({ segment: segment });
  };

  toggleEdit = () => {
    this.setState({ editing: !this.state.editing });
  };

  resetPassword = () => {
    const { fireBaseAuth } = this.props;
    this.props.resetPassword(fireBaseAuth.email);
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

  handleChange = (e: any) => {
    this.setState({
      user: {
        ...this.state.user,
        [e.target.name]: e.target.value,
      },
    });
  };

  handleSubmit = (e: any) => {
    let { user } = this.state;
    let { fireBaseAuth, profile } = this.props;

    if (e) {
      e.preventDefault();
    }
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (phoneRegex.test(user.phoneNumber)) {
      const formattedPhoneNumber = user.phoneNumber.replace(
        phoneRegex,
        "$1-$2-$3"
      );
      user.phoneNumber = formattedPhoneNumber;

      //check if user was not registered before asking for push notification access
      if (
        this.state.user.pushEnabled === true &&
        profile.pushEnabled === false
      ) {
        registerForPush(
          fireBaseAuth.uid,
          this.props.updateParticipantDeviceToken
        ).then((res: any) => {
          if (res === false) {
            user.pushEnabled = false;
            this.setChecked("pushEnabled", false);
            window.alert(
              "Push notifications are disabled for SHAPE on your phone. You can change this by modifying your device's notification settings."
            );
          }
        });
      }

      this.props.updateParticipant(fireBaseAuth.uid, user);
      this.toggleEdit();
    } else {
      this.setState({
        validationError: {
          error: true,
          message: "Please enter a valid phone number",
        },
      });
    }
  };

  render() {
    let { editing, user, segment, goHome, validationError } = this.state;
    let { profile, fireBaseAuth, isLoading } = this.props;
    let { isEmpty } = fireBaseAuth;
    if (isEmpty || goHome) return <Redirect to={routes.LOGIN} />;
    return (
      <IonPage>
        <AppHeader showHeader={true} text={"Profile"} />
        <IonSegment onIonChange={(e) => this.setSegment(e.detail.value as any)}>
          <IonSegmentButton
            value="respondent"
            defaultChecked={segment === "respondent"}
          >
            <IonLabel>Respondent</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="participant">
            <IonLabel>Participants</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="preferences">
            <IonLabel>Preferences</IonLabel>
          </IonSegmentButton>
        </IonSegment>
        <IonContent className="ion-padding">
          <p className="small-text ion-padding-start">
            Respondent ID: {profile.participantId}
          </p>
          <p className="small-text ion-padding-start">
            Build Info: {build.build}, {build.buildDate}&nbsp;
            <a
              href="https://patientexperience.app"
              target="_blank"
              rel="noopener noreferrer"
              title="About SHAPE"
            >
              <IonIcon icon={informationCircleSharp} />
            </a>
          </p>
          <ViewProfile
            isEditing={editing}
            profile={profile}
            fireBaseAuth={fireBaseAuth}
            show={segment === segments.RESPONDENT}
          />
          <EditProfile
            isEditing={editing}
            user={user}
            handleChange={this.handleChange}
            handleSubmit={this.handleSubmit}
            toggleEdit={this.toggleEdit}
            handlePhone={this.handlePhone}
            show={segment === segments.RESPONDENT}
          />

          <EditParticipant
            show={segment === segments.PARTICIPANT}
            toggleEdit={this.toggleEdit}
            profile={profile}
            updateParticipant={this.props.updateParticipant}
            fireBaseAuth={fireBaseAuth}
          />

          <EditPreferences
            show={segment === segments.PREFERENCES}
            user={user}
            handleSubmit={this.handleSubmit}
            setChecked={this.setChecked}
          />
        </IonContent>

        <ProfileEditSave
          show={segment === segments.RESPONDENT}
          isEditing={editing}
          toggleEdit={this.toggleEdit}
        />

        <IonToast
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

        <PreferenceButtons
          show={segment === segments.PREFERENCES}
          resetPassword={this.resetPassword}
          logout={this.logout}
        />

        {isLoading && <Loading />}
      </IonPage>
    );
  }
}

export default Profile;
