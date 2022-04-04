import React, { Component, createRef } from "react";
import Chart from "chart.js";
import { getBarOptions } from ".";
import { ParticipantResponse, Questionnaire } from "../../interfaces/DataTypes";

interface PassedProps {
  participantResponse: Array<ParticipantResponse>;
  questionnaires: Array<Questionnaire>;
}

interface ChartCanvasState {
  completed: number;
  notStarted: number;
  inProgress: number;
}

class ChartCanvas extends Component<PassedProps, ChartCanvasState> {
  canvas: any;
  chart: any;
  constructor(props: PassedProps) {
    super(props);
    this.state = {
      completed: 0,
      notStarted: 0,
      inProgress: 0,
    };
    this.canvas = createRef<HTMLCanvasElement>();
    this.chart = null;
    this.updateCanvas = this.updateCanvas.bind(this);
  }

  componentDidMount() {
    let notStarted = this.getNumNotStarted();
    let completed = this.getNumCompleted();
    let inProgress = this.getNumInProgress();
    let self = this;
    this.setState(
      {
        completed,
        notStarted,
        inProgress,
      },
      () => {
        self.updateCanvas();
      }
    );
  }

  getNumNotStarted = () => {
    let questionnaires = this.props.questionnaires;
    let numNotStarted = 0;
    let participantResponse = this.props.participantResponse;
    for (let questionnaire of questionnaires) {
      let matchingResp = participantResponse.find(
        (r: ParticipantResponse) => r.questionnaireId === questionnaire.id
      );
      if (!matchingResp) {
        numNotStarted += 1;
      }
    }
    return numNotStarted;
  };

  getNumCompleted = () => {
    let questionnaires = this.props.questionnaires;
    let numCompleted = 0;
    let participantResponse = this.props.participantResponse;
    for (let questionnaire of questionnaires) {
      let matchingResp = participantResponse.filter(
        (r: ParticipantResponse) => r.questionnaireId === questionnaire.id
      );
      if (matchingResp) {
        // If at least one response is complete
        if (matchingResp.some((res: ParticipantResponse) => res.complete))
          numCompleted += 1;
      }
    }
    return numCompleted;
  };

  UNSAFE_componentWillReceiveProps(
    nextProps: Readonly<PassedProps>,
    nextContext: PassedProps
  ): void {
    if (this.props.participantResponse !== nextProps.participantResponse) {
    }
  }

  getNumInProgress = () => {
    let questionnaires = this.props.questionnaires;
    let numInProgress = 0;
    let participantResponse = this.props.participantResponse;
    for (let questionnaire of questionnaires) {
      let matchingResp = participantResponse.filter(
        (r: ParticipantResponse) => r.questionnaireId === questionnaire.id
      );

      if (matchingResp && matchingResp.length > 0) {
        // If not even one response is complete
        if (matchingResp.every((res: ParticipantResponse) => !res.complete))
          numInProgress += 1;
      }
    }
    return numInProgress;
  };

  updateStatuses() {
    let notStarted = this.getNumNotStarted();
    let completed = this.getNumCompleted();
    let inProgress = this.getNumInProgress();
    this.setState({
      completed,
      notStarted,
      inProgress,
    });
  }

  updateChart() {
    if (!this.chart) return;
    let numQuestionnaires = this.props.questionnaires.length;
    let { completed, notStarted, inProgress } = this.state;
    let newData = {
      labels: [],
      datasets: [
        {
          data: [completed],
          backgroundColor: "#66B584",
          hoverBackgroundColor: "rgba(50,90,100,1)",
          label: `${completed} of ${numQuestionnaires} Completed`,
        },
        {
          data: [inProgress],
          backgroundColor: "#F7987A",
          hoverBackgroundColor: "rgba(140,85,100,1)",
          label: `${inProgress} of ${numQuestionnaires} In Progress`,
        },
        {
          data: [notStarted],
          backgroundColor: "#2A7CBA",
          hoverBackgroundColor: "rgba(46,185,235,1)",
          label: `${notStarted} of ${numQuestionnaires} Not Started`,
        },
      ],
    };
    this.chart.data.datasets = newData.datasets;
    this.chart.update();
  }

  updateCanvas() {
    const ctx: CanvasRenderingContext2D | null = this.canvas.current
      ? this.canvas.current.getContext("2d")
      : null;
    let self = this;
    let numQuestionnaires = self.props.questionnaires.length;
    let { completed, notStarted, inProgress } = this.state;

    let percentage = (data: number) => {
      if (numQuestionnaires === 0) return `0%`;
      else return `${Math.floor((data / numQuestionnaires) * 100)}%`;
    };

    if (ctx) {
      this.chart = new Chart(ctx, {
        type: "horizontalBar",
        data: {
          labels: [],
          datasets: [
            {
              data: [completed],
              backgroundColor: "#66B584",
              hoverBackgroundColor: "rgba(50,90,100,1)",
              label: `${completed} of ${numQuestionnaires} Completed (${percentage(
                completed
              )})`,
            },
            {
              data: [inProgress],
              backgroundColor: "#F7987A",
              hoverBackgroundColor: "rgba(140,85,100,1)",
              label: `${inProgress} of ${numQuestionnaires} In Progress (${percentage(
                inProgress
              )})`,
            },
            {
              data: [notStarted],
              backgroundColor: "#2A7CBA",
              hoverBackgroundColor: "rgba(46,185,235,1)",
              label: `${notStarted} of ${numQuestionnaires} Not Started (${percentage(
                notStarted
              )})`,
            },
          ],
        },
        options: getBarOptions(numQuestionnaires),
      });
    }
  }

  render() {
    return <canvas ref={this.canvas} width={160} height={40} />;
  }
}
export default ChartCanvas;
