import React, { Component } from "react";
import { connect } from "react-redux";
import { User, QuestionnaireQuestion } from "../../../../interfaces/DataTypes";
import InfoCard from "../InfoCard";

interface PassedProps {
  question: QuestionnaireQuestion;
  profile: User;
  org: string;
}

class InfoCardContainer extends Component<PassedProps, {}> {
  render() {
    let { question, profile, org } = this.props;
    return <InfoCard question={question} profile={profile} org={org} />;
  }
}

const mapStateToProps = (state: any) => ({
  profile: state.firebase.profile,
  org: state.org,
});

const mapDispatchToProps = (dispatch: any) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(InfoCardContainer);
