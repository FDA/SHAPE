import React, { Component } from "react";
import { isLoading } from "../../../../redux/actions/Authentication";
import {
  clearSearch,
  getEhrAccessCode,
  getEhrBearerToken,
  getEHRUserCode,
  providerSearch,
  setTargetEHR,
} from "../../../../redux/actions/Ehr";
import { FirebaseAuth, Person, EHR } from "../../../../interfaces/DataTypes";
import { connect } from "react-redux";
import StartEHRLinkProcess from "../StartEHRLinkProcess";

interface PassedProps {
  ehr: any;
  getEHRUserCodeDispatch: Function;
  auth: FirebaseAuth;
  getEhrAccessCodeDispatch: Function;
  getEhrBearerTokenDispatch: Function;
  isLoadingDispatch: Function;
  providerSearchDispatch: Function;
  selectedProfile: Person;
  setTargetEHRDispatch: Function;
  clearSearchDispatch: Function;
  loading: boolean;
}

class StartEHRLinkProcessContainer extends Component<PassedProps, {}> {
  render() {
    let {
      ehr,
      getEHRUserCodeDispatch,
      auth,
      getEhrAccessCodeDispatch,
      getEhrBearerTokenDispatch,
      isLoadingDispatch,
      providerSearchDispatch,
      selectedProfile,
      setTargetEHRDispatch,
      clearSearchDispatch,
      loading,
    } = this.props;

    return (
      <StartEHRLinkProcess
        ehr={ehr}
        getEHRUserCode={getEHRUserCodeDispatch}
        auth={auth}
        getEhrAccessCode={getEhrAccessCodeDispatch}
        getEhrBearerToken={getEhrBearerTokenDispatch}
        isLoading={isLoadingDispatch}
        providerSearch={providerSearchDispatch}
        selectedProfile={selectedProfile}
        setTargetEHR={setTargetEHRDispatch}
        clearSearch={clearSearchDispatch}
        loading={loading}
      />
    );
  }
}

const mapStateToProps = (state: any) => ({
  loading: state.loading,
  auth: state.firebase.auth,
  ehr: state.ehr,
  selectedProfile: state.selectedProfile,
});

const mapDispatchToProps = (dispatch: any) => {
  return {
    isLoadingDispatch(loading: boolean) {
      dispatch(isLoading(loading));
    },
    getEHRUserCodeDispatch(participantId: string) {
      dispatch(getEHRUserCode(participantId));
    },
    getEhrAccessCodeDispatch(participantId: string) {
      dispatch(getEhrAccessCode(participantId));
    },
    getEhrBearerTokenDispatch(participantId: string, accessCode: string) {
      dispatch(getEhrBearerToken(participantId, accessCode));
    },
    providerSearchDispatch(term: string, token: string) {
      dispatch(providerSearch(term, token));
    },
    setTargetEHRDispatch(ehr: EHR) {
      dispatch(setTargetEHR(ehr));
    },
    clearSearchDispatch() {
      dispatch(clearSearch());
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(StartEHRLinkProcessContainer);
