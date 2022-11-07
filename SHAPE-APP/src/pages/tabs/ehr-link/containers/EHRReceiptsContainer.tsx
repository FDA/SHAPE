import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FirebaseAuth, EHRReceipt, Survey } from '../../../../interfaces/DataTypes';
import EHRReceipts from '../EHRReceipts';

interface ParentReceipt {
    ehrReceipts: Array<EHRReceipt>;
}

interface PassedProps {
    fireBaseAuth: FirebaseAuth;
    isLoading: boolean;
    receipt: ParentReceipt;
    surveys: Array<Survey>;
}

class EHRReceiptsContainer extends Component<PassedProps, {}> {
    render() {
        const { fireBaseAuth, isLoading, receipt, surveys } = this.props;
        return (
            <EHRReceipts
                fireBaseAuth={fireBaseAuth}
                isLoading={isLoading}
                receipt={receipt}
                surveys={surveys}
            />
        );
    }
}

const mapStateToProps = (state: any) => ({
    fireBaseAuth: state.firebase.auth,
    isLoading: state.loading,
    receipt: state.receipt,
    surveys: state.surveys
});

const mapDispatchToProps = (/* dispatch: any */) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(EHRReceiptsContainer);
