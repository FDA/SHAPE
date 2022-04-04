import React, { Component } from "react";
import { connect } from "react-redux";
import { fetchPatientEHR } from "../../../../redux/actions/Ehr";
import { RouteComponentProps } from "react-router";
import {
  EHR,
  User,
  FirebaseAuth,
  Person,
} from "../../../../interfaces/DataTypes";
import LinkPatientEHR from "../LinkPatientEHR";

interface PassedProps extends RouteComponentProps {
  ehr: any;
  selected: EHR;
  fetchPatientEHRDispatch: Function;
  loading: boolean;
  profile: User;
  fireBaseAuth: FirebaseAuth;
  selectedProfile: Person;
}

class LinkPatientEHRContainer extends Component<PassedProps, {}> {
  render() {
    let {
      ehr,
      selected,
      fetchPatientEHRDispatch,
      loading,
      profile,
      fireBaseAuth,
      selectedProfile,
      history,
      location,
      match,
    } = this.props;
    return (
      <LinkPatientEHR
        ehr={ehr}
        selected={selected}
        fetchPatientEHR={fetchPatientEHRDispatch}
        loading={loading}
        profile={profile}
        fireBaseAuth={fireBaseAuth}
        selectedProfile={selectedProfile}
        history={history}
        location={location}
        match={match}
      />
    );
  }
}

const mapStateToProps = (state: any) => ({
  fireBaseAuth: state.firebase.auth,
  profile: state.firebase.profile,
  ehr: state.ehr,
  selectedProfile: state.selectedProfile,
});
const mapDispatchToProps = (dispatch: any) => ({
  fetchPatientEHRDispatch(patientId: string, ehr: any) {
    dispatch(fetchPatientEHR(patientId, ehr));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LinkPatientEHRContainer);
