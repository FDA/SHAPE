import React, { Component } from "react";
import { connect } from "react-redux";
import {
  submitDiary,
  getDiaryEntries,
} from "../../../../../redux/actions/Diary";
import { User, Survey, Person } from "../../../../../interfaces/DataTypes";
import "../../Diary.css";
import Withdrawal from "../Withdrawal";

interface EventFormProps {
  setView: Function;
  submitDiaryDispatch: Function;
  getDiaryEntriesDispatch: Function;
  profile: User;
  survey: Survey | null;
  participant: Person;
  userId: string;
}

interface EventFormState {
  formType: any;
  withdrawalDate: any;
  withdrawalReason: any;
  error: boolean;
}

class WithdrawalContainer extends Component<EventFormProps, EventFormState> {
  render() {
    const {
      setView,
      submitDiaryDispatch,
      getDiaryEntriesDispatch,
      profile,
      survey,
      participant,
      userId,
    } = this.props;
    return (
      <Withdrawal
        setView={setView}
        submitDiary={submitDiaryDispatch}
        getDiaryEntries={getDiaryEntriesDispatch}
        profile={profile}
        survey={survey}
        participant={participant}
        userId={userId}
      />
    );
  }
}

const mapStateToProps = (state: any) => ({
  profile: state.firebase.profile,
  userId: state.firebase.auth.uid,
});

const mapDispatchToProps = (dispatch: any) => ({
  submitDiaryDispatch(diary: any) {
    dispatch(submitDiary(diary));
  },
  getDiaryEntriesDispatch() {
    dispatch(getDiaryEntries());
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WithdrawalContainer);
