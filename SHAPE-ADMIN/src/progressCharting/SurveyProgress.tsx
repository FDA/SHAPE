import React, {Component, createRef} from 'react';
import {connect} from 'react-redux';
import {IonItem, IonLabel, IonList, IonListHeader, IonCol} from '@ionic/react';
import Chart from 'chart.js';
import {getBarOptions} from '.';
import {Survey} from '../interfaces/DataTypes';

interface Props {
    survey: Survey;
    allCompleted: Array<string>;
    noneStarted: Array<string>;
    inProgress: Array<string>;
}

class SurveyProgress extends Component<Props, {}> {
    canvas: any;
    chart: any;

    constructor(props: Props) {
        super(props);
        this.canvas = createRef<HTMLCanvasElement>();
        this.chart = null;
    }

    componentDidUpdate() {
        this.updateCanvas();
    }

    updateCanvas() {
        const ctx: CanvasRenderingContext2D | null = this.canvas.current
            ? this.canvas.current.getContext('2d')
            : null;
        let numParticipants = this.props.survey.participants.length;
        let {allCompleted, noneStarted, inProgress} = this.props;
        let numCompleted = allCompleted.length;
        let numInProgress = inProgress.length;
        let numNotStarted = noneStarted.length;

        if (ctx) {
            this.chart = new Chart(ctx, {
                type: 'horizontalBar',
                data: {
                    labels: [],
                    datasets: [
                        {
                            data: [numCompleted],
                            backgroundColor: '#66B584',
                            label: `${numCompleted} of ${numParticipants} participants Completed (${
                                (numCompleted / numParticipants) * 100
                            }%)`
                        },
                        {
                            data: [numInProgress],
                            backgroundColor: '#F6987A',
                            label: `${numInProgress} of ${numParticipants} participants In Progress (${
                                (numInProgress / numParticipants) * 100
                            }%)`
                        },
                        {
                            data: [numNotStarted],
                            backgroundColor: '#007CBA',
                            label: `${numNotStarted} of ${numParticipants} participants Not Started (${
                                (numNotStarted / numParticipants) * 100
                            }%)`
                        }
                    ]
                },
                options: getBarOptions()
            });
        }
    }

    getInProgress = () => {
        let {inProgress, survey} = this.props;
        if (!survey.participants) {
            return <IonItem>N/A</IonItem>;
        }

        return inProgress.map((e: string) => {
            return <IonItem key={`$inProgress-${e}`}>{`${e}`}</IonItem>;
        });
    };

    getNotStarted = () => {
        let {noneStarted, survey} = this.props;
        if (!survey.participants) {
            return <IonItem>N/A</IonItem>;
        }

        return noneStarted.map((e: string) => {
            return <IonItem key={`$noneStarted-${e}`}>{`${e}`}</IonItem>;
        });
    };

    getCompleted = () => {
        let {allCompleted, survey} = this.props;
        if (!survey.participants) {
            return <IonItem>N/A</IonItem>;
        }

        return allCompleted.map((e: string) => {
            return <IonItem key={`$allCompleted-${e}`}>{`${e}`}</IonItem>;
        });
    };

    render() {
        return (
            <IonList>
                <IonListHeader color="light">
                    <IonCol size="6">
                        <IonLabel>Progress</IonLabel>
                    </IonCol>
                    <IonCol size="2">
                        <IonLabel>Completed</IonLabel>
                    </IonCol>
                    <IonCol size="2">
                        <IonLabel>In Progress</IonLabel>
                    </IonCol>
                    <IonCol size="2">
                        <IonLabel>Not Started</IonLabel>
                    </IonCol>
                </IonListHeader>
                <IonItem key="survey-progress">
                    <IonCol size="6">
                        <canvas ref={this.canvas} width={160} height={40} />
                    </IonCol>
                    <IonCol size="2">{this.getCompleted()}</IonCol>
                    <IonCol size="2">{this.getInProgress()}</IonCol>
                    <IonCol size="2">{this.getNotStarted()}</IonCol>
                </IonItem>
            </IonList>
        );
    }
}

function mapStateToProps(state: any) {
    return {
        survey: state.survey
    };
}

export default connect(mapStateToProps)(SurveyProgress);
