import React, { Component } from "react";
import {
  participantLookup,
  resetparticipantLookup,
} from "../../../redux/actions/Participant";
import { connect } from "react-redux";
import { isLoading, getOrgs } from "../../../redux/actions/Authentication";
import { ParticipantLookup as PL, Choice } from "../../../interfaces/DataTypes";
import ParticipantLookup from "../ParticipantLookup";

interface PassedProps {
  toggleLoading: Function;
  lookup: Function;
  resetLookup: Function;
  setOrgs: Function;
  loading: boolean;
  participant: PL;
  darkMode: boolean;
  orgs: Choice[];
}

interface ParticipantLookupContainerState {}

class ParticipantLookupContainer extends Component<
  PassedProps,
  ParticipantLookupContainerState
> {
  UNSAFE_componentWillMount() {
    this.props.setOrgs();
  }

  render = () => {
    const {
      toggleLoading,
      lookup,
      resetLookup,
      loading,
      participant,
      darkMode,
      orgs,
    } = this.props;

    return (
      <ParticipantLookup
        toggleLoading={toggleLoading}
        participantLookup={lookup}
        resetparticipantLookup={resetLookup}
        loading={loading}
        participant={participant}
        darkMode={darkMode}
        orgs={orgs}
      />
    );
  };
}

export const mapStateToProps = (state: any) => ({
  loading: state.loading,
  participant: state.participant,
  darkMode: state.darkMode,
  orgs: state.orgs,
});

export const mapDispatchToProps = (dispatch: any) => {
  return {
    lookup(participantId: string, org: string) {
      dispatch(participantLookup(participantId, org));
    },
    resetLookup() {
      dispatch(resetparticipantLookup());
    },
    toggleLoading(loading: boolean) {
      dispatch(isLoading(loading));
    },
    setOrgs() {
      dispatch(getOrgs());
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ParticipantLookupContainer);
