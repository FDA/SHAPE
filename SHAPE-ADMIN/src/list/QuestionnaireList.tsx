import { IonCard, IonCardContent, IonCol, IonGrid, IonRow, IonText } from '@ionic/react';
import { chunk } from 'lodash';
import { isEmptyObject } from '../utils/Utils';
import { Questionnaire, Survey } from '../interfaces/DataTypes';
import React, { Component } from 'react';
import { formatISO } from 'date-fns';
import { connect } from 'react-redux';
import Loading from '../layout/Loading';
import { storeQuestionnaire, newQuestionnaire } from '../redux/actions/Questionnaire';
import { Q13Card } from './components';
import { routes } from '../utils/Constants';

interface PassedProps {
    surveyId: string;
}

interface ReduxProps {
    questionnaireList: Array<Questionnaire>;
    storeQuestionnaireDispatch: Function;
    survey: Survey;
    newQuestionnaireDispatch: Function;
    isLoading: boolean;
}

interface State {
    error: boolean;
}

class QuestionnaireList extends Component<PassedProps & ReduxProps, State> {
    constructor(props: PassedProps & ReduxProps) {
        super(props);
        this.state = {
            error: false
        };
    }

    render() {
        let duplicate = (questionnaire: Questionnaire) => {
            let q = { ...questionnaire };
            q.name = q.name + '-copy';
            q.open = false;
            q.dateCreated = formatISO(new Date());
            q.locked = false;
            this.props.newQuestionnaireDispatch(q);
        };

        let displayData: any[] = [];
        let { error } = this.state;
        let { surveyId, survey, isLoading, questionnaireList } = this.props;

        let chunkedData = chunk(questionnaireList, 4);

        if (!isEmptyObject(chunkedData)) {
            for (let i = 0; i < chunkedData.length; i++) {
                let questionnaires = chunkedData[i];
                let rowData = questionnaires.map((questionnaire: Questionnaire, index: number) => {
                    return (
                        <IonCol size='3' key={`q-${index}`}>
                            <Q13Card
                                key={questionnaire.id}
                                id={questionnaire.id}
                                aria-label={`go to ${questionnaire.name}`}
                                href={`${routes.SURVEY}/${surveyId}/questionnaire/${questionnaire.id}`}
                                duplicate={duplicate}
                                questionnaire={questionnaire}
                                surveyLocked={
                                    !survey.open && (!isEmptyObject(survey.locked) ? survey.locked : false)
                                }
                                storeQuestionnaire={this.props.storeQuestionnaireDispatch}
                            />
                        </IonCol>
                    );
                });
                let rowComponent = <IonRow key={`r-${i}`}>{rowData}</IonRow>;
                displayData.push(rowComponent);
            }

            return <IonGrid>{displayData}</IonGrid>;
        } else if (error) {
            return (
                <IonCard style={{ textAlign: 'center' }}>
                    <IonCardContent>
                        <IonText color='danger'>Error loading questionnaires. Try refreshing.</IonText>
                    </IonCardContent>
                </IonCard>
            );
        } else if (isEmptyObject(chunkedData) && !isLoading) {
            return (
                <IonCard style={{ textAlign: 'center' }}>
                    <IonCardContent>No questionnaires are currently available.</IonCardContent>
                </IonCard>
            );
        } else {
            return (
                isLoading && (
                    <IonRow text-center>
                        <IonCol size='12' style={{ textAlign: 'center' }}>
                            <Loading />
                        </IonCol>
                    </IonRow>
                )
            );
        }
    }
}

function mapStateToProps(state: any) {
    return {
        survey: state.survey,
        questionnaireList: state.questionnaireList,
        isLoading: state.loading
    };
}

function mapDispatchToProps(dispatch: any) {
    return {
        storeQuestionnaireDispatch(questionnaireId: string) {
            dispatch(storeQuestionnaire(questionnaireId));
        },
        newQuestionnaireDispatch(questionnaire: any) {
            dispatch(newQuestionnaire(questionnaire));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(QuestionnaireList);
