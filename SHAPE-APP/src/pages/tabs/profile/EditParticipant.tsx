import React, { Component, SyntheticEvent } from "react";
import { guid, isEmptyObject } from "../../../utils/Utils";
import {
  IonAlert,
  IonFab,
  IonFabButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
} from "@ionic/react";
import { format } from "date-fns";
import { Redirect } from "react-router";
import PersonEditor from "./PersonEditor";
import { personAdd } from "ionicons/icons";
import { dateFormats, routes, environments } from "../../../utils/Constants";
import { Person, User, FirebaseAuth } from "../../../interfaces/DataTypes";
import { cloneDeep } from "lodash";

interface PassedProps {
  show: boolean;
  toggleEdit: Function;
  profile: User;
  updateParticipant: Function;
  fireBaseAuth: FirebaseAuth;
}

interface CreateParticipantState {
  person: Person;
  participants: Array<Person>;
  error: boolean;
  dirty: boolean;
  showModal: boolean;
}

class EditParticipant extends Component<PassedProps, CreateParticipantState> {
  constructor(props: PassedProps) {
    super(props);

    this.state = {
      error: false,
      dirty: false,
      person: { name: "", dob: "", id: guid(), isNew: true, gender: "" },
      showModal: false,
      participants: cloneDeep(this.props.profile.profiles),
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
    this.cancel = this.cancel.bind(this);
  }

  add = (e: SyntheticEvent) => {
    const person = { name: "", dob: "", id: guid(), isNew: true, gender: "" };
    this.setState({ person: person });
    this.setShowModal(true);
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
    const { person, participants } = this.state;
    let updatedParticipants = participants;
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
      let length = participants.filter((elem: Person) => {
        return elem.id === person.id;
      });

      if (length.length === 0) {
        participants.push(person);
      } else {
        updatedParticipants = participants.map((elem: Person) => {
          if (elem.id === person.id) {
            return person;
          } else return elem;
        });
      }
      this.setState({ participants: updatedParticipants });
      this.save(updatedParticipants);
      this.setShowModal(false);
    } else {
      this.toggleError();
    }
  };

  cancel = () => {
    this.setState({
      dirty: false,
      showModal: false,
      participants: cloneDeep(this.props.profile.profiles),
    });

    this.setShowModal(false);
  };

  handleRemove = (e: SyntheticEvent) => {
    e.preventDefault();
    const { participants } = this.state;
    const { person } = this.state;
    if (process.env.NODE_ENV === environments.DEVELOPMENT)
      console.log(
        `Removing Person: ${person.name} DOB: ${person.dob} IDX: ${person.id}`
      );
    let updatedParticipants = participants.filter((elem: Person) => {
      return elem.id !== person.id;
    });
    this.setState({ participants: updatedParticipants });
    this.setShowModal(false);
    this.save(updatedParticipants);
  };

  handleChange = (event: any) => {
    const { name, value } = event.target;
    const { person } = this.state;
    this.setState({
      person: {
        ...person,
        [name]: value,
      },
      dirty: true,
    });
  };

  save = (participants: Array<Person>) => {
    let { fireBaseAuth } = this.props;
    this.props.updateParticipant(fireBaseAuth.uid, { profiles: participants });
  };

  render() {
    const { show } = this.props;
    const { participants } = this.state;
    const { isEmpty } = this.props.fireBaseAuth;
    if (isEmpty) return <Redirect to={routes.LOGIN} />;
    if (!show) {
      return null;
    }
    const {
      person = { name: "", dob: "", id: guid(), isNew: true, gender: "" },
    } = this.state;
    return (
      <>
        <h3>Add or change Participant information</h3>
        <p>
          Click the add button to include participants. If you are the
          participant (or one of the participants), add yourself.
        </p>
        <p>
          To remove a participant, click the particpant's name, then remove.
        </p>
        <IonList>
          {participants.map((p: Person) => {
            return (
              <IonItem
                key={p.dob}
                onClick={() => this.personEditor(p)}
                detail={true}
              >
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
          })}
        </IonList>
        <PersonEditor
          person={person}
          setShowModal={this.setShowModal}
          showModal={this.state.showModal}
          handleSubmit={this.handleSubmit}
          cancel={this.cancel}
          handleChange={this.handleChange}
          handleRemove={this.handleRemove}
        />
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={(e) => this.add(e)}>
            <IonIcon icon={personAdd} />
          </IonFabButton>
        </IonFab>
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
      </>
    );
  }
}

export default EditParticipant;
