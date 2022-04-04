import React, { Component } from "react";
import { EventForm, DoctorVisit, Withdrawal } from ".";
import { formType, User, Survey, Person } from "../../../interfaces/DataTypes";
import "./Diary.css";
import { isEmptyObject } from "../../../utils/Utils";
import { diaryViews } from "../../../utils/Constants";
import { CustomDropdown } from "./components";

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

class NewEntry extends Component<NewEntryProps, NewEntryState> {
  constructor(props: NewEntryProps) {
    super(props);
    this.state = {
      view: diaryViews.SURVEYSELECTION,
      formType: "Event Form",
      surveySelection: "",
      profileName: "",
      profileDOB: "",
      participant: {
        id: 0,
        name: "",
        dob: "",
        gender: "",
        isNew: false,
      },
      // for routing to withdrawal from disabling account page
      selectedView: !isEmptyObject(window.location.search)
        ? new URLSearchParams(window.location.search).get("type")
        : null,
    };
  }

  componentDidMount() {
    let survey = "";
    let participant: Person = {
      id: 0,
      name: "",
      dob: "",
      gender: "",
      isNew: false,
    };
    if (this.props.surveys.length === 1) {
      survey = this.props.surveys[0].id;
    }
    if (this.props.profile.profiles.length === 1) {
      participant = this.props.profile.profiles[0];
    }
    this.setState({
      surveySelection: survey,
      profileName: participant.name,
      profileDOB: participant.dob,
      participant: participant,
    });
  }

  setView = (view: view) => {
    this.setState({
      view: view,
    });
  };

  handleSurveySelect = (event: any) => {
    let name = event.target.value;
    this.setState({
      surveySelection: name,
    });
  };

  handleViewSelect = (event: any) => {
    let name = event.target.value;
    this.setState({
      selectedView: name,
    });
  };

  handleParticipantSelect = (event: any) => {
    let participant = event.target.value;
    this.setState({
      profileName: participant.name,
      profileDOB: participant.dob,
      participant: participant,
    });
  };

  handleNext = (event: any) => {
    event.preventDefault();
    let { selectedView } = this.state;
    if (
      this.state.surveySelection !== null &&
      this.state.surveySelection !== "" &&
      this.state.profileName !== "" &&
      this.state.selectedView !== null
    ) {
      this.setState({
        view: selectedView,
      });
    }
  };

  handleSegmentSelect = (e: any) => {
    this.setState({
      formType: e.target.value,
    });
  };

  render() {
    let {
      view,
      profileName,
      profileDOB,
      surveySelection,
      participant,
      selectedView,
    } = this.state;
    let { profile, surveys } = this.props;

    if (view === diaryViews.SURVEYSELECTION)
      return (
        <CustomDropdown
          surveySelection={surveySelection}
          handleSurveySelect={this.handleSurveySelect}
          profile={profile}
          participant={participant}
          handleParticipantSelect={this.handleParticipantSelect}
          handleNext={this.handleNext}
          surveys={surveys}
          view={selectedView}
          handleViewSelect={this.handleViewSelect}
        />
      );

    if (view === diaryViews.HEALTHEVENT)
      return (
        <EventForm
          setView={this.setView}
          profileName={profileName}
          profileDOB={profileDOB}
          surveyId={this.state.surveySelection}
        />
      );

    if (view === diaryViews.CLINICALVISIT)
      return (
        <DoctorVisit
          setView={this.setView}
          surveyId={surveySelection}
          profileName={profileName}
          profileDOB={profileDOB}
        />
      );

    if (view === diaryViews.WITHDRAWAL)
      return (
        <Withdrawal
          setView={this.setView}
          profileName={profileName}
          profileDOB={profileDOB}
          surveyId={surveySelection}
        />
      );

    return null;
  }
}

export default NewEntry;
