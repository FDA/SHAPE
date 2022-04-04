import React from "react";
import QuestionnaireInstanceContainer from "./containers/QuestionnaireInstanceContainer";
import { ParticipantResponse } from "../../interfaces/DataTypes";
import { RouteComponentProps, withRouter } from "react-router";

interface PassedProps extends RouteComponentProps {
  participantResponse: Array<ParticipantResponse>;
  participantId: string;
  history: any;
}

const QuestionnaireWrapper: React.FC<PassedProps> = (props) => {
  // @ts-ignore
  const surveyId = props.match.params.surveyId;
  // @ts-ignore
  const id = props.match.params.id;
  // @ts-ignore
  const questionnaireId = props.match.params.id;

  const { location, match, history } = props;
  return (
    <QuestionnaireInstanceContainer
      surveyId={surveyId}
      id={id}
      questionnaireId={questionnaireId}
      location={location}
      match={match}
      history={history}
    />
  );
};

export default withRouter(QuestionnaireWrapper);
