import React, { Component } from "react";
import { connect } from "react-redux";
import {
  submitDiary,
  getDiaryEntries,
} from "../../../../../redux/actions/Diary";
import "../../Diary.css";
import EventForm from "../EventForm";
import { Participant } from "../../../../../interfaces/DataTypes";

interface EventFormProps {
  setView: Function;
  submitDiaryDispatch: Function;
  getDiaryEntriesDispatch: Function;
  profile: Participant;
  surveyId: string;
  profileName: string;
  profileDOB: string;
}

class EventFormContainer extends Component<EventFormProps, {}> {
  render() {
    const {
      setView,
      submitDiaryDispatch,
      getDiaryEntriesDispatch,
      profile,
      surveyId,
      profileName,
      profileDOB,
    } = this.props;
    return (
      <EventForm
        setView={setView}
        submitDiary={submitDiaryDispatch}
        getDiaryEntries={getDiaryEntriesDispatch}
        profile={profile}
        surveyId={surveyId}
        profileName={profileName}
        profileDOB={profileDOB}
      />
    );
  }
}

const mapStateToProps = (state: any) => ({
  profile: state.firebase.profile,
});

const mapDispatchToProps = (dispatch: any) => ({
  submitDiaryDispatch(diary: any) {
    dispatch(submitDiary(diary));
  },
  getDiaryEntriesDispatch(participantId: string, org: string) {
    dispatch(getDiaryEntries(participantId, org));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(EventFormContainer);
