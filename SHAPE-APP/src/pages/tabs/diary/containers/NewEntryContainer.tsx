import React, { Component } from "react";
import { connect } from "react-redux";
import {
  formType,
  User,
  Survey,
  Person,
} from "../../../../interfaces/DataTypes";
import NewEntry from "../NewEntry";

type view = null | string;

interface NewEntryProps {
  setDisplay: Function;
  profile: User;
  surveys: Array<Survey>;
}
interface NewEntryState {
  view: view;
  formType: formType;
  surveySelection: string;
  profileName: string;
  profileDOB: string;
  participant: Person;
  selectedView: view;
}

class NewEntryContainer extends Component<NewEntryProps, NewEntryState> {
  render() {
    let { setDisplay, profile, surveys } = this.props;
    return (
      <NewEntry setDisplay={setDisplay} profile={profile} surveys={surveys} />
    );
  }
}

const mapStateToProps = (state: any) => ({
  profile: state.firebase.profile,
  surveys: state.surveys,
});

const mapDispatchToProps = (dispatch: any) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(NewEntryContainer);
