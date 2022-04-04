import React, { Component, SyntheticEvent } from "react";
import { Redirect, RouteComponentProps } from "react-router-dom";
import {
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonText,
} from "@ionic/react";
import { Person, FirebaseAuth, User } from "../../../interfaces/DataTypes";
import AppHeader from "../../layout/AppHeader";
import { personSharp } from "ionicons/icons";
import { routes } from "../../../utils/Constants";
import { isEmptyObject } from "../../../utils/Utils";

interface PassedProps {
  fireBaseAuth: FirebaseAuth;
  setActiveProfile: Function;
  profile: User;
}

interface AddEHRState {
  redirect: boolean;
  redirectTarget: null | string;
  surveyId: string;
  questionnaireId: string;
}

class AddEHR extends Component<PassedProps & RouteComponentProps, AddEHRState> {
  constructor(props: PassedProps & RouteComponentProps) {
    super(props);
    this.state = {
      redirect: false,
      redirectTarget: null,
      //@ts-ignore
      surveyId: props.match.params.id,
      //@ts-ignore
      questionnaireId: props.match.params.q13id,
    };
  }

  UNSAFE_componentWillReceiveProps(
    nextProps: Readonly<PassedProps & RouteComponentProps>,
    nextContext: PassedProps & RouteComponentProps
  ): void {
    this.setState({
      redirect: false,
      redirectTarget: null,
      //@ts-ignore
      surveyId: nextProps.match.params.id,
      //@ts-ignore
      questionnaireId: nextProps.match.params.q13id,
    });
  }

  onClick = (
    event: SyntheticEvent,
    participantProfile: Person,
    hrefUrl: string
  ): void => {
    event.preventDefault();

    this.props.setActiveProfile(participantProfile);
    this.props.history.push(hrefUrl);
  };

  render() {
    const { isEmpty } = this.props.fireBaseAuth;
    const { redirect, redirectTarget } = this.state;
    if (isEmpty) return <Redirect to={routes.LOGIN} />;
    if (redirect) {
      return <Redirect to={redirectTarget} />;
    }
    const { profile } = this.props;
    return (
      <IonPage>
        <AppHeader showHeader={true} text={"Select Participant"} />
        <IonContent className="ion-padding">
          <IonText>
            <h1>Choose Participant</h1>
          </IonText>
          <IonText color="dark">
            Please choose the participant profile you are importing the EHR of.
          </IonText>
          <IonList>
            {!isEmptyObject(profile.profiles) &&
              profile.profiles.map((participantProfile: Person) => {
                const hrefUrl = routes.START_EHR_LINK;
                return (
                  <IonItem
                    button={true}
                    key={participantProfile.name}
                    detail={true}
                    onClick={(e: any) =>
                      this.onClick(e, participantProfile, hrefUrl)
                    }
                    routerLink={hrefUrl}
                  >
                    <IonLabel>
                      <IonIcon
                        icon={personSharp}
                        style={{ float: "left", marginRight: "8px", zoom: 2.0 }}
                      />
                      <h1>{participantProfile.name}</h1>
                      <div style={{ padding: "2px" }}>
                        Gender: {participantProfile.gender}
                      </div>
                      <div style={{ padding: "2px" }}>
                        DOB:{participantProfile.dob}
                      </div>
                    </IonLabel>
                  </IonItem>
                );
              })}
          </IonList>
        </IonContent>
      </IonPage>
    );
  }
}

export default AddEHR;
