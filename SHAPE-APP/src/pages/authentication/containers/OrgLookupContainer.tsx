import React, { Component } from "react";
import { connect } from "react-redux";
import { isLoading, getOrgs, selectOrg } from "../../../redux/actions/Authentication";
import { Choice } from "../../../interfaces/DataTypes";
import OrgLookup from "../OrgLookup";

interface PassedProps {
  toggleLoading: Function;
  setOrgs: Function;
  loading: boolean;
  orgs: Choice[];
  selectOrgDispatch: Function;
  isEmpty: boolean;
}

interface OrgLookupContainerState {}

class OrgLookupContainer extends Component<
  PassedProps,
  OrgLookupContainerState
> {
  UNSAFE_componentWillMount() {
    this.props.setOrgs();
  }

  render = () => {
    const {
      toggleLoading,
      loading,
      orgs,
      selectOrgDispatch,
      isEmpty
    } = this.props;

    return (
      <OrgLookup
        toggleLoading={toggleLoading}
        loading={loading}
        orgs={orgs}
        selectOrg={selectOrgDispatch}
        isEmpty={isEmpty}
      />
    );
  };
}

export const mapStateToProps = (state: any) => ({
  loading: state.loading,
  darkMode: state.darkMode,
  orgs: state.orgs,
  isEmpty: state.firebase.auth.isEmpty,
});

export const mapDispatchToProps = (dispatch: any) => {
  return {
    toggleLoading(loading: boolean) {
      dispatch(isLoading(loading));
    },
    setOrgs() {
      dispatch(getOrgs());
    },
    selectOrgDispatch(org:string) {
        dispatch(selectOrg(org));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OrgLookupContainer);
