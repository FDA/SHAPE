import React, { Component } from "react";
import { connect } from "react-redux";

import {
  getDiaryEntries,
  submitDiary,
} from "../../../../../redux/actions/Diary";
import "../../Diary.css";
import { Participant, Diary } from "../../../../../interfaces/DataTypes";
import DoctorVisit from "../DoctorVisit";

interface DrVisitProps {
  setView: Function;
  submitDiaryDispatch: Function;
  getDiaryEntriesDispatch: Function;
  profile: Participant;
  surveyId: string;
  profileName: string;
  profileDOB: string;
}

class DoctorVisitContainer extends Component<DrVisitProps, {}> {
  render() {
    const {
      profile,
      submitDiaryDispatch,
      getDiaryEntriesDispatch,
      setView,
      surveyId,
      profileName,
      profileDOB,
    } = this.props;
    return (
      <DoctorVisit
        profile={profile}
        submitDiary={submitDiaryDispatch}
        getDiaryEntries={getDiaryEntriesDispatch}
        setView={setView}
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
  submitDiaryDispatch(diary: Diary) {
    dispatch(submitDiary(diary));
  },
  getDiaryEntriesDispatch(participantId: string, org: string) {
    dispatch(getDiaryEntries(participantId, org));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DoctorVisitContainer);
