import React, { Component } from "react";
import { connect } from "react-redux";
import { isLoading, selectPublicSurvey, getPublicSurveys } from "../../../../redux/actions/Authentication";
import PublicOrgLookup from "../PublicOrgLookup";


interface SurveyOrgName {
    id: string,
    org: string,
    name: string
}

interface PassedProps {
  toggleLoading: Function;
  setPublicSurveys: Function;
  loading: boolean;
  publicSurveys: Array<SurveyOrgName>;
  selectPublicSurveyDispatch: Function;
}

interface OrgLookupContainerState {}

class PublicOrgLookupContainer extends Component<
  PassedProps,
  OrgLookupContainerState
> {
  UNSAFE_componentWillMount() {
    this.props.setPublicSurveys();
  }

  render = () => {
    const {
      toggleLoading,
      loading,
      publicSurveys,
      selectPublicSurveyDispatch
    } = this.props;

    return (
      <PublicOrgLookup
        toggleLoading={toggleLoading}
        loading={loading}
        publicSurveys={publicSurveys}
        selectPublicSurvey={selectPublicSurveyDispatch}
      />
    );
  };
}

export const mapStateToProps = (state: any) => ({
  loading: state.loading,
  darkMode: state.darkMode,
  publicSurveys: state.publicSurveys,
});

export const mapDispatchToProps = (dispatch: any) => {
  return {
    toggleLoading(loading: boolean) {
      dispatch(isLoading(loading));
    },
    setPublicSurveys() {
      dispatch(getPublicSurveys());
    },
    selectPublicSurveyDispatch(id: string, org: string, name:string) {
        dispatch(selectPublicSurvey(id, org, name));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PublicOrgLookupContainer);
