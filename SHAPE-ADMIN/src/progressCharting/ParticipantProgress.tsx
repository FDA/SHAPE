import React, {Component, createRef} from 'react';
import {connect} from 'react-redux';

import Chart from 'chart.js';
import {getParticipantResponses, getEnrolledQuestionnaires} from '../utils/API';
import {getBarOptions} from '.';
import {
    Questionnaire,
    Survey,
    ParticipantResponse
} from '../interfaces/DataTypes';

interface Props {
    survey: Survey;
    participantId: string;
    setQuestionnaireStatus: Function;
    setAllCompleted: Function;
    setNoneStarted: Function;
    setInProgress: Function;
}

interface ParticipantResponseObject {
    id: string;
    data: ParticipantResponse;
}

interface QuestionnaireObject {
    id: string;
    data: Questionnaire;
}

interface QObject {
    participantId: string;
    data: Array<{id: string; name: string}>;
}

interface State {
    completed: number;
    notStarted: number;
    inProgress: number;
    numQuestionnaires: number;
    questionnaires: Array<QuestionnaireObject>;
    participantResponse: Array<ParticipantResponseObject>;
    notStartedQs: [];
    inProgressQs: [];
    completedQs: [];
}

class ParticipantProgress extends Component<Props, State> {
    private _isMounted = false;
    canvas: any;
    chart: any;

    constructor(props: Props) {
        super(props);
        this.state = {
            completed: 0,
            notStarted: 0,
            inProgress: 0,
            numQuestionnaires: 0,
            questionnaires: [],
            participantResponse: [],
            notStartedQs: [],
            inProgressQs: [],
            completedQs: []
        };
        this.canvas = createRef<HTMLCanvasElement>();
        this.chart = null;
    }

    componentDidMount() {
        let self = this;
        this._isMounted = true;
        this.loadResponses()
            .then(() => self.setProgressState())
            .then(() => self.updateCanvas())
            .catch((e: any) => console.error(e));
    }
    
    componentWillUnmount() {
        this._isMounted = false;
    }

    loadResponses = () => {
        let surveyId = this.props.survey.id;
        let {participantId} = this.props;

        let self = this;

        let p1 = getParticipantResponses(surveyId, participantId);
        let p2 = getEnrolledQuestionnaires(surveyId, participantId);

        return Promise.all([p1, p2])
            .then((res: any) => {
                let participantResponse: Array<ParticipantResponseObject> = [];
                let questionnaires: Array<QuestionnaireObject> = [];

                res[0].forEach((doc: any) => {
                    let temp = {
                        id: doc.id,
                        data: doc.data
                    };
                    participantResponse.push(temp);
                });
                res[1].forEach((doc: any) => {
                    let temp = {
                        id: doc.id,
                        data: doc.data
                    };
                    questionnaires.push(temp);
                });

                return new Promise((resolve: any) => {
                    if(self._isMounted){
                        self.setState(
                            {
                                participantResponse,
                                questionnaires
                            }
                        );
                    }
                    resolve();
                });
            })
            .catch((e: any) => console.error(e));
    };

    setProgressState = () => {
        let self = this;

        let notStarted = this.setNumNotStarted();
        let completed = this.setNumCompleted();
        let inProgress = this.setNumInProgress();

        return new Promise((resolve: any) => {
            if(self._isMounted){
                self.setState(
                    {
                        completed,
                        notStarted,
                        inProgress
                    }
                );
            }
            resolve();
        });
    };

    setNumNotStarted = () => {
        let questionnaires = this.state.questionnaires;

        if (questionnaires.length > 0) {
            let numNotStarted = 0;
            let participantResponse = this.state.participantResponse;
            let {participantId, setNoneStarted} = this.props;

            let notStartedQs: QObject = {
                participantId,
                data: []
            };

            let questionnaireContainsParticipant: QuestionnaireObject[] = [];

            for (let index in questionnaires) {
                let current = questionnaires[index];

                if (
                    current.data.participants.includes(participantId) &&
                    current.data.open === true
                ) {
                    questionnaireContainsParticipant.push(current);
                }

                let matchingResp = participantResponse.find(
                    (r: any) => r.data.questionnaireId === current.id
                );

                if (!matchingResp) {
                    numNotStarted += 1;
                    notStartedQs.data.push({
                        id: current.id,
                        name: current.data.name
                    });
                }
            }

            if (
                notStartedQs.data.length ===
                questionnaireContainsParticipant.length
            ) {
                setNoneStarted(participantId);
            }

            this.props.setQuestionnaireStatus('notStartedQs', notStartedQs);

            return numNotStarted;
        }
    };

    setNumCompleted = () => {
        let questionnaires = this.state.questionnaires;

        if (questionnaires.length > 0) {
            let numCompleted = 0;
            let participantResponse = this.state.participantResponse;
            let {participantId, setAllCompleted, setInProgress} = this.props;
            let completedQs: QObject = {
                participantId,
                data: []
            };
            let questionnaireContainsParticipant: QuestionnaireObject[] = [];

            for (let index in questionnaires) {
                let current = questionnaires[index];

                if (
                    current.data.participants.includes(participantId) &&
                    current.data.open === true
                ) {
                    questionnaireContainsParticipant.push(current);
                }

                let matchingResp = participantResponse.filter(
                    (r: any) => r.data.questionnaireId === current.id
                );

                if (matchingResp) {
                    // If at least one response is complete
                    if (matchingResp.some((res: any) => res.data.complete)) {
                        numCompleted += 1;

                        completedQs.data.push({
                            id: current.id,
                            name: current.data.name
                        });
                    }
                }
            }

            if (
                completedQs.data.length ===
                questionnaireContainsParticipant.length
            ) {
                setAllCompleted(participantId);
            }

            if (
                completedQs.data.length > 0 &&
                completedQs.data.length !==
                    questionnaireContainsParticipant.length
            ) {
                setInProgress(participantId);
            }

            this.props.setQuestionnaireStatus('completedQs', completedQs);

            return numCompleted;
        }
    };

    setNumInProgress = () => {
        let questionnaires = this.state.questionnaires;

        let numInProgress = 0;
        let participantResponse = this.state.participantResponse;
        let {participantId} = this.props;

        let inProgressQs: QObject = {
            participantId,
            data: []
        };

        for (let index in questionnaires) {
            let current = questionnaires[index];

            let matchingResp = participantResponse.filter(
                (r: any) => r.data.questionnaireId === current.id
            );
            if (matchingResp && matchingResp.length > 0) {
                // If not even one response is complete
                if (matchingResp.every((res: any) => !res.data.complete)) {
                    numInProgress += 1;
                    inProgressQs.data.push({
                        id: current.id,
                        name: current.data.name
                    });
                }
            }
        }

        this.props.setQuestionnaireStatus('inProgressQs', inProgressQs);
        return numInProgress;
    };

    updateCanvas() {
        const ctx: CanvasRenderingContext2D | null = this.canvas.current
            ? this.canvas.current.getContext('2d')
            : null;
        let numQuestionnaires = this.state.questionnaires.length;
        let {completed, notStarted, inProgress} = this.state;

        if (ctx) {
            this.chart = new Chart(ctx, {
                type: 'horizontalBar',
                data: {
                    labels: [],
                    datasets: [
                        {
                            data: [completed],
                            backgroundColor: '#66B584',
                            label: `${completed} of ${numQuestionnaires} Questionnaires Completed (${
                                completed > 0
                                    ? (completed / numQuestionnaires) * 100
                                    : '0'
                            }%)`
                        },
                        {
                            data: [inProgress],
                            backgroundColor: '#F6987A',
                            label: `${inProgress} of ${numQuestionnaires} Questionnaires In Progress (${
                                inProgress > 0
                                    ? (inProgress / numQuestionnaires) * 100
                                    : '0'
                            }%)`
                        },
                        {
                            data: [notStarted],
                            backgroundColor: '#007CBA',
                            label: `${notStarted} of ${numQuestionnaires} Questionnaires Not Started (${
                                notStarted > 0
                                    ? (notStarted / numQuestionnaires) * 100
                                    : '0'
                            }%)`
                        }
                    ]
                },
                options: getBarOptions()
            });
        }
    }

    render() {
        return <canvas ref={this.canvas} width={160} height={40} />;
    }
}

function mapStateToProps(state: any) {
    return {
        survey: state.survey
    };
}

export default connect(mapStateToProps)(ParticipantProgress);
