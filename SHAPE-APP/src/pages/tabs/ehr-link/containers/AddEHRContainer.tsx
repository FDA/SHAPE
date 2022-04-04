import React, { Component } from "react";
import { RouteComponentProps } from "react-router-dom";
import { connect } from "react-redux";
import { setActiveProfile } from "../../../../redux/actions/Questionnaire";
import { FirebaseAuth, User } from "../../../../interfaces/DataTypes";
import AddEHR from "../AddEHR";

interface PassedProps {
  fireBaseAuth: FirebaseAuth;
  setActiveProfileDispatch: Function;
  profile: User;
}

class AddEHRContainer extends Component<PassedProps & RouteComponentProps, {}> {
  render() {
    let {
      fireBaseAuth,
      setActiveProfileDispatch,
      profile,
      history,
      match,
      location,
    } = this.props;
    return (
      <AddEHR
        fireBaseAuth={fireBaseAuth}
        setActiveProfile={setActiveProfileDispatch}
        profile={profile}
        history={history}
        match={match}
        location={location}
      />
    );
  }
}

const mapStateToProps = (state: any) => ({
  fireBaseAuth: state.firebase.auth,
  profile: state.firebase.profile,
});

const mapDispatchToProps = (dispatch: any) => {
  return {
    setActiveProfileDispatch(profile: any) {
      dispatch(setActiveProfile(profile));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AddEHRContainer);
