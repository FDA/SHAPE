import React, { Component, SyntheticEvent } from "react";

import {
  IonAlert,
  IonButton,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
} from "@ionic/react";
import Loading from "../layout/Loading";
import { personAdd } from "ionicons/icons";
import { format } from "date-fns";
import { Person } from "../../interfaces/DataTypes";
import { isEmptyObject } from "../../utils/Utils";
import AppHeader from "../layout/AppHeader";
import PersonEditor from "./PersonEditor";
import { dateFormats, environments, routes } from "../../utils/Constants";

interface PassedProps {
  names: Array<Person>;
  addParticipantNames: Function;
  isLoading: boolean;
}

interface AddParticipantState {
  person: Person;
  showModal: boolean;
  error: boolean;
}

class AddParticipants extends Component<PassedProps, AddParticipantState> {
  constructor(props: PassedProps) {
    super(props);

    const person = {
      name: "",
      dob: "",
      id: 0,
      isNew: true,
      gender: "",
    };

    this.state = {
      showModal: false,
      person: person,
      error: false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
  }

  add = (e: SyntheticEvent) => {
    let participants = this.props.names;
    const person = {
      name: "",
      dob: "",
      id: participants.length,
      isNew: true,
      gender: "",
    };
    this.setState({ person: person });
    this.setShowModal(true);
  };

  addNames = (participants: Array<Person>) => {
    if (process.env.NODE_ENV === environments.DEVELOPMENT)
      console.log(
        `Adding names: ${participants} to the participant redux store`
      );
    this.props.addParticipantNames(participants);
  };

  personEditor = (person: Person) => {
    person.isNew = false;
    this.setState({ person: person, showModal: true });
  };

  setShowModal = (show: boolean) => {
    this.setState({ showModal: show });
  };

  toggleError = () => {
    this.setState({ error: !this.state.error });
  };

  handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    const { person } = this.state;
    let participants = this.props.names;

    if (
      !isEmptyObject(person.dob) &&
      !isEmptyObject(person.name) &&
      !isEmptyObject(person.gender)
    ) {
      person.dob = format(new Date(person.dob), dateFormats.MMddyyyy);
      if (process.env.NODE_ENV === environments.DEVELOPMENT)
        console.log(
          `Person: ${person.name} DOB: ${person.dob} IDX: ${person.id}`
        );
      if (person.id >= participants.length) {
        participants.push(person);
      } else {
        const index = participants.findIndex(
          (obj: Person) => obj.id === person.id
        );
        participants[index] = person;
      }
      this.addNames(participants);
      this.setShowModal(false);
    } else {
      this.toggleError();
    }
  };

  handleRemove = (e: SyntheticEvent) => {
    e.preventDefault();
    let participants = this.props.names;
    const { person } = this.state;
    if (process.env.NODE_ENV === environments.DEVELOPMENT)
      console.log(
        `Removing Person: ${person.name} DOB: ${person.dob} IDX: ${person.id}`
      );
    const arry = participants.filter((p: Person) => {
      return p.id !== person.id;
    });
    this.props.addParticipantNames(arry);
    this.setShowModal(false);
  };

  handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    const { person } = this.state;
    this.setState({
      person: {
        ...person,
        [name]: value,
      },
    });
  }

  render() {
    let participants = this.props.names;
    const { isLoading } = this.props;
    const LoadingIndicator = isLoading ? <Loading /> : null;
    const { person } = this.state;
    const shouldProceed = participants.length > 0;
    const list = participants.map((p: Person, index: number) => {
      p.id = index;
      return (
        <IonItem key={p.name} onClick={() => this.personEditor(p)}>
          <IonLabel>
            <h2>
              {p.name} ({p.gender}){" "}
            </h2>
          </IonLabel>
          <IonNote slot="end">
            <p>DOB: {p.dob}</p>
          </IonNote>
        </IonItem>
      );
    });
    const nextButton = shouldProceed ? (
      <div style={{ marginTop: ".5em" }}>
        <IonButton
          expand="block"
          fill="solid"
          routerLink={routes.REGISTER}
          id="securityQuestions"
          color="primary"
        >
          Next
        </IonButton>
      </div>
    ) : null;
    return (
      <IonPage>
        <AppHeader showHeader={true} text={"Add Participants"} />
        <IonContent className="ion-padding">
          {LoadingIndicator}
          <p className="hero-text">Add or change Participant information</p>
          <p className="small-text">
            Click the <span style={{ color: "blue" }}>blue</span> add button to
            include participants. If you are the participant (or one of the
            participants), add yourself. To remove a participant, click the
            particpant's name, then remove them.
          </p>
          <IonList>{list}</IonList>
          {nextButton}
          <PersonEditor
            person={person}
            setShowModal={this.setShowModal}
            showModal={this.state.showModal}
            handleSubmit={this.handleSubmit}
            handleChange={this.handleChange}
            handleRemove={this.handleRemove}
          />
          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton onClick={(e) => this.add(e)}>
              <IonIcon icon={personAdd} />
            </IonFabButton>
          </IonFab>
        </IonContent>
        <IonAlert
          isOpen={this.state.error}
          onDidDismiss={() => this.toggleError()}
          header={"Error"}
          message={"All fields must be filled."}
          buttons={[
            {
              text: "OK",
            },
          ]}
        />
      </IonPage>
    );
  }
}

// Connected Component
export default AddParticipants;
