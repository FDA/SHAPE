import React, { Component } from "react";
import { connect } from "react-redux";
import { addParticipantNames } from "../../../redux/actions/Participant";
import { Person } from "../../../interfaces/DataTypes";
import AddParticipants from "../AddParticipants";

interface PassedProps {
  names: Array<Person>;
  addNames: Function;
  isLoading: boolean;
}

interface AddParticipantContainerState {}

class AddParticipantsContainer extends Component<
  PassedProps,
  AddParticipantContainerState
> {
  render() {
    const { names, addNames, isLoading } = this.props;
    return (
      <AddParticipants
        names={names}
        addParticipantNames={addNames}
        isLoading={isLoading}
      />
    );
  }
}

// Map Redux state to component props
// makes store available to props
export const mapStateToProps = (state: any) => ({
  isLoading: state.loading,
  names: state.names,
});

export const mapDispatchToProps = (dispatch: any) => ({
  addNames: (participants: Array<Person>) =>
    dispatch(addParticipantNames(participants)),
});

// Connected Component
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddParticipantsContainer);
