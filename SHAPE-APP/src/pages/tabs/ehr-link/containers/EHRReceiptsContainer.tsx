import React, { Component } from "react";
import { connect } from "react-redux";
import { FirebaseAuth, EHRReceipt } from "../../../../interfaces/DataTypes";
import EHRReceipts from "../EHRReceipts";

interface ParentReceipt {
  ehrReceipts: Array<EHRReceipt>;
}

interface PassedProps {
  fireBaseAuth: FirebaseAuth;
  isLoading: boolean;
  receipt: ParentReceipt;
}

class EHRReceiptsContainer extends Component<PassedProps, {}> {
  render() {
    let { fireBaseAuth, isLoading, receipt } = this.props;
    return (
      <EHRReceipts
        fireBaseAuth={fireBaseAuth}
        isLoading={isLoading}
        receipt={receipt}
      />
    );
  }
}

const mapStateToProps = (state: any) => ({
  fireBaseAuth: state.firebase.auth,
  isLoading: state.loading,
  receipt: state.receipt,
});

const mapDispatchToProps = (dispatch: any) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EHRReceiptsContainer);
