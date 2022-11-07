import React, { Component } from "react";
import { patientSearch } from "../../../../redux/actions/Ehr";
import { connect } from "react-redux";
import OnComplete from "../OnComplete";

interface PassedProps {
  ehr: any;
  patientSearchDispatch: Function;
  loading: boolean;
}

class OnCompleteContainer extends Component<PassedProps, {}> {
  render() {
    const { ehr, patientSearchDispatch, loading } = this.props;
    return (
      <OnComplete
        ehr={ehr}
        patientSearch={patientSearchDispatch}
        loading={loading}
      />
    );
  }
}

const mapStateToProps = (state: any) => ({
  loading: state.loading,
  ehr: state.ehr,
});

const mapDispatchToProps = (dispatch: any) => {
  return {
    patientSearchDispatch(ehr: any) {
      dispatch(patientSearch(ehr));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OnCompleteContainer);
