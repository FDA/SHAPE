import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getDiaryEntries, submitDiary } from '../../../../../redux/actions/Diary';
import '../../Diary.css';
import { User, Diary, Survey, Person } from '../../../../../interfaces/DataTypes';
import DoctorVisit from '../DoctorVisit';

interface DrVisitProps {
    setView: Function;
    submitDiaryDispatch: Function;
    getDiaryEntriesDispatch: Function;
    profile: User;
    survey: Survey | null;
    participant: Person;
    userId: string;
}

class DoctorVisitContainer extends Component<DrVisitProps, {}> {
    render() {
        const {
            profile,
            submitDiaryDispatch,
            getDiaryEntriesDispatch,
            setView,
            survey,
            participant,
            userId
        } = this.props;
        return (
            <DoctorVisit
                profile={profile}
                submitDiary={submitDiaryDispatch}
                getDiaryEntries={getDiaryEntriesDispatch}
                setView={setView}
                survey={survey}
                participant={participant}
                userId={userId}
            />
        );
    }
}

const mapStateToProps = (state: any) => ({
    profile: state.firebase.profile,
    userId: state.firebase.auth.uid
});

const mapDispatchToProps = (dispatch: any) => ({
    submitDiaryDispatch(diary: Diary) {
        dispatch(submitDiary(diary));
    },
    getDiaryEntriesDispatch() {
        dispatch(getDiaryEntries());
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(DoctorVisitContainer);
