import React, { Component } from "react";
import { RouteComponentProps } from "react-router-dom";
import {
  User,
  FirebaseAuth,
  ParticipantResponse,
  Questionnaire,
} from "../../../interfaces/DataTypes";
import {
  getAllPreviewQuestionnaires,
  getQuestionnaires,
} from "../../../redux/actions/Questionnaire";
import { connect } from "react-redux";
import ChooseQuestionnaire from "../ChooseQuestionnaire";

interface PassedProps extends RouteComponentProps {
  profile: User;
  fireBaseAuth: FirebaseAuth;
  getAllPreviewQuestionnairesDispatch: Function;
  getQuestionnairesDispatch: Function;
  questionnaires: Array<Questionnaire>;
  participantResponse: Array<ParticipantResponse>;
}

interface ChooseQuestionnaireState {
  surveyId: string;
}

class ChooseQuestionnaireContainer extends Component<
  PassedProps,
  ChooseQuestionnaireState
> {
  render() {
    let {
      profile,
      fireBaseAuth,
      getAllPreviewQuestionnairesDispatch,
      getQuestionnairesDispatch,
      questionnaires,
      participantResponse,
      history,
      location,
      match,
    } = this.props;
    return (
      <ChooseQuestionnaire
        profile={profile}
        fireBaseAuth={fireBaseAuth}
        getAllPreviewQuestionnaires={getAllPreviewQuestionnairesDispatch}
        getQuestionnaires={getQuestionnairesDispatch}
        questionnaires={questionnaires}
        participantResponse={participantResponse}
        history={history}
        location={location}
        match={match}
      />
    );
  }
}

const mapStateToProps = (state: any) => ({
  profile: state.firebase.profile,
  fireBaseAuth: state.firebase.auth,
  questionnaires: state.questionnaires,
  participantResponse: state.participantResponse,
});

const mapDispatchToProps = (dispatch: any) => {
  return {
    getQuestionnairesDispatch(participantId: string, org: string) {
      dispatch(getQuestionnaires(participantId, org));
    },
    getAllPreviewQuestionnairesDispatch(
      surveyId: string,
      participantId: string
    ) {
      dispatch(getAllPreviewQuestionnaires(surveyId, participantId));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChooseQuestionnaireContainer);
