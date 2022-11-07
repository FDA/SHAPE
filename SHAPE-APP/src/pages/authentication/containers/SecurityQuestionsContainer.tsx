import React, { Component } from "react";
import { resetparticipantLookup } from "../../../redux/actions/Participant";
import { connect } from "react-redux";
import { Participant } from "../../../interfaces/DataTypes";
import SecurityQuestions from "../SecurityQuestions";

interface PassedProps {
  participant: Participant;
  isLoading: boolean;
  resetLookup: Function;
  isEmpty: boolean;
  org: string;
}

interface SecurityQuestionsContainerState {
  answers: any;
  userVerified: boolean | null;
}

class SecurityQuestionsContainer extends Component<
  PassedProps,
  SecurityQuestionsContainerState
> {
  render = () => {
    const { participant, isLoading, resetLookup, isEmpty, org} = this.props;
    return (
      <SecurityQuestions
        participant={participant}
        isLoading={isLoading}
        resetparticipantLookup={resetLookup}
        isEmpty={isEmpty}
        org={org}
      />
    );
  };
}

export const mapStateToProps = (state: any) => ({
  isLoading: state.loading,
  participant: state.participant,
  isEmpty: state.firebase.auth.isEmpty,
  org: state.selectedOrg,
});

export const mapDispatchToProps = (dispatch: any) => ({
  resetLookup() {
    dispatch(resetparticipantLookup());
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SecurityQuestionsContainer);
