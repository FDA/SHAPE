import React, { Component } from "react";
import AddParticipantsQuery from "../AddParticipantsQuery";

interface PassedProps {}

interface AddParticipantsQueryContainerState {}

class AddParticipantsQueryContainer extends Component<
  PassedProps,
  AddParticipantsQueryContainerState
> {
  render() {
    return (
      <AddParticipantsQuery/>
    );
  }
}

export default AddParticipantsQueryContainer;