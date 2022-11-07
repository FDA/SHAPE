import React, { Component } from "react";
import { connect } from "react-redux";
import { FirebaseAuth, DiaryResponse } from "../../../../interfaces/DataTypes";
import Diary from "../Diary";

interface DiaryProps {
  setDisplay: Function;
  userDiaryEntries: Array<DiaryResponse>;
  fireBaseAuth: FirebaseAuth;
}

class DiaryContainer extends Component<DiaryProps, {}> {
  render() {
    const { setDisplay, userDiaryEntries, fireBaseAuth } = this.props;
    return (
      <Diary
        setDisplay={setDisplay}
        userDiaryEntries={userDiaryEntries}
        fireBaseAuth={fireBaseAuth}
      />
    );
  }
}

const mapStateToProps = (state: any) => ({
  fireBaseAuth: state.firebase.auth,
  userDiaryEntries: state.userDiaryEntries,
});

const mapDispatchToProps = (/* dispatch: any */) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(DiaryContainer);
