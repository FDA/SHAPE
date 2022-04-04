import React, { Component, ReactNode } from "react";

import { IonModal } from "@ionic/react";
import { Person } from "../../interfaces/DataTypes";
import PersonEditorContent from "./PersonEditorContent";

interface PersonEditorProps {
  children?: ReactNode;
  person: Person;
  setShowModal: Function;
  showModal: boolean;
  handleSubmit: Function;
  handleChange: Function;
  handleRemove: Function;
}

class PersonEditor extends Component<PersonEditorProps> {
  render() {
    const {
      person = {
        id: 0,
        name: "",
        dob: "",
        isNew: true,
        gender: "",
      },
      setShowModal,
      handleSubmit,
      handleChange,
      handleRemove,
      showModal,
    } = this.props;
    return (
      <IonModal
        isOpen={showModal}
        swipeToClose={false}
        onDidDismiss={() => setShowModal(false)}
      >
        <PersonEditorContent
          person={person}
          setShowModal={setShowModal}
          handleSubmit={handleSubmit}
          handleChange={handleChange}
          handleRemove={handleRemove}
        />
      </IonModal>
    );
  }
}

export default PersonEditor;
