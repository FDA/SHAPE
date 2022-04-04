import React from "react";
import { connect } from "react-redux";
import { resetEHR } from "../../../../redux/actions/Ehr";
import { setEHRReceipts } from "../../../../redux/actions/Participant";
import { isLoading } from "../../../../redux/actions/Authentication";
import {
  User,
  EHRReceipt,
  Person,
  EHR,
} from "../../../../interfaces/DataTypes";
import EHRUploader from "../EHRUploader";

interface PassedProps {
  profile: User;
  uid: string;
  selectedEHR: EHR;
  patientId: string;
  selectedProfile: Person;
  setEHRDispatch: Function;
  toggleLoadingDispatch: Function;
  loading: boolean;
  data: any;
  resetEHRDispatch: Function;
}

const EHRUploaderBase = (props: PassedProps) => {
  let {
    profile,
    uid,
    selectedEHR,
    patientId,
    selectedProfile,
    setEHRDispatch,
    toggleLoadingDispatch,
    loading,
    data,
    resetEHRDispatch,
  } = props;
  return (
    <EHRUploader
      profile={profile}
      uid={uid}
      selectedEHR={selectedEHR}
      patientId={patientId}
      selectedProfile={selectedProfile}
      setEHR={setEHRDispatch}
      toggleLoading={toggleLoadingDispatch}
      loading={loading}
      data={data}
      resetEHR={resetEHRDispatch}
    />
  );
};

const mapStateToProps = (state: any) => ({
  loading: state.loading,
});

function mapDispatchToProps(dispatch: any) {
  return {
    toggleLoadingDispatch(loading: boolean) {
      dispatch(isLoading(loading));
    },
    resetEHRDispatch: () => dispatch(resetEHR()),
    setEHRDispatch(receipts: Array<EHRReceipt>) {
      dispatch(setEHRReceipts(receipts));
    },
  };
}

const EHRUploaderContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(EHRUploaderBase);
export default EHRUploaderContainer;
