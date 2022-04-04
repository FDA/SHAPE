import React, { Component } from "react";
import { connect } from "react-redux";
import { ParticipantResponse } from "../../../interfaces/DataTypes";
import ChartCanvas from "../ChartCanvas";

interface PassedProps {
  participantResponse: Array<ParticipantResponse>;
  questionnaires: any;
}

class ChartCanvasContainer extends Component<PassedProps> {
  render() {
    const { questionnaires, participantResponse } = this.props;

    return (
      <ChartCanvas
        questionnaires={questionnaires}
        participantResponse={participantResponse}
      />
    );
  }
}
const mapStateToProps = (state: any) => ({
  participantResponse: state.participantResponse,
});

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChartCanvasContainer);
