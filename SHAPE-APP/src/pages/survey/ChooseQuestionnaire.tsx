import React, { Component, ReactNode } from 'react';
import AppHeader from '../layout/AppHeader';
import {
    IonCol,
    IonContent,
    IonGrid,
    IonLabel,
    IonPage,
    IonRefresher,
    IonRefresherContent,
    IonRow,
    IonSegment,
    IonSegmentButton,
    IonToolbar,
    RefresherEventDetail
} from '@ionic/react';
import { RouteComponentProps } from 'react-router-dom';
import { User, FirebaseAuth, ParticipantResponse, Questionnaire } from '../../interfaces/DataTypes';
import { NoDataCard, Q13Card } from './components';
import {
    isEmptyObject,
    profilesWithCompletedResponse,
    profilesWithNoCompletedResponse
} from '../../utils/Utils';
import { routes } from '../../utils/Constants';

interface PassedProps extends RouteComponentProps {
    profile: User;
    fireBaseAuth: FirebaseAuth;
    refreshAll: Function;
    questionnaireView: string;
    setQuestionnaireView: Function;
    getAllPreviewQuestionnaires: Function;
    getQuestionnaires: Function;
    questionnaires: Array<Questionnaire>;
    participantResponse: Array<ParticipantResponse>;
}

interface ChooseQuestionnaireState {
    surveyId: string;
}

class ChooseQuestionnaire extends Component<PassedProps, ChooseQuestionnaireState> {
    constructor(props: PassedProps) {
        super(props);
        this.state = {
            surveyId: ''
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps: Readonly<PassedProps>): void {
        const { match } = nextProps;
        //@ts-ignore
        const surveyId: string = match.params.id;
        this.setState({ surveyId: surveyId });
    }

    componentDidMount(): void {
        const { match, profile } = this.props;
        const { isEmpty } = this.props.fireBaseAuth;
        const { participantId, org } = profile;
        //@ts-ignore
        const { previewmode } = match.params;
        //@ts-ignore
        const surveyId: string = match.params.id;
        this.setState({ surveyId: surveyId });

        this.props.setQuestionnaireView('todo');
        if (!isEmpty) {
            if (previewmode) {
                this.props.getAllPreviewQuestionnaires(surveyId);
            } else {
                this.props.getQuestionnaires(participantId, org);
            }
        }
    }

    filterQuestionnaires() {
        const { surveyId } = this.state;
        const { questionnaires, questionnaireView, profile, participantResponse } = this.props;

        return questionnaires
            .filter((q: Questionnaire) => {
                return q.surveyId === surveyId;
            })
            .filter((q: Questionnaire) => {
                if (questionnaireView === 'todo') {
                    return (
                        profilesWithNoCompletedResponse(q.id, participantResponse, profile).length > 0 &&
                        q.open !== undefined &&
                        q.open === true
                    );
                } else if (questionnaireView === 'complete') {
                    return profilesWithCompletedResponse(q.id, participantResponse, profile).length > 0;
                } else return true;
            })
            .sort((a: Questionnaire, b: Questionnaire) => (a.dateCreated < b.dateCreated ? 1 : -1));
    }

    refreshState(event: CustomEvent<RefresherEventDetail>) {
        this.props.refreshAll();
        setTimeout(() => {
            event.detail.complete();
        }, 500);
    }

    render() {
        const { surveyId } = this.state;
        const { questionnaires, participantResponse, questionnaireView, profile } = this.props;
        //@ts-ignore
        const { previewmode, token } = this.props.match.params;

        let displayData: ReactNode = <NoDataCard questionnaireView={questionnaireView} />;

        if (!isEmptyObject(surveyId) && questionnaires) {
            const rowData = this.filterQuestionnaires();

            if (rowData.length > 0) {
                displayData = rowData.map((questionnaire: Questionnaire) => {
                    let hrefUrl = '';
                    if (previewmode) {
                        hrefUrl = `${routes.PREVIEW_QUESTIONNAIRE}/survey/${surveyId}/questionnaire/${questionnaire.id}/token/${token}`;
                    } else {
                        hrefUrl = `${routes.SURVEY}/${surveyId}/questionnaire/${questionnaire.id}`;
                    }
                    const numQuestions = questionnaire.questions.length;
                    return (
                        <IonRow key={questionnaire.id}>
                            <IonCol>
                                <Q13Card
                                    id={questionnaire.id}
                                    href={hrefUrl}
                                    name={questionnaire.name}
                                    description={questionnaire.description}
                                    shortDescription={questionnaire.shortDescription}
                                    profile={profile}
                                    participantResponse={participantResponse}
                                    numQuestions={numQuestions}
                                    questionnaireView={questionnaireView}
                                />
                            </IonCol>
                        </IonRow>
                    );
                });
            }
        }

        return (
            <IonPage>
                <AppHeader showHeader={true} text={'Select Questionnaire'} noBorder={true} />
                <IonToolbar>
                    <IonSegment
                        value={questionnaireView}
                        onIonChange={(e) => this.props.setQuestionnaireView(e.detail.value)}>
                        <IonSegmentButton value='todo'>
                            <IonLabel>To-Do</IonLabel>
                        </IonSegmentButton>
                        <IonSegmentButton value='complete'>
                            <IonLabel>Complete</IonLabel>
                        </IonSegmentButton>
                    </IonSegment>
                </IonToolbar>
                <IonContent>
                    <IonRefresher slot='fixed' onIonRefresh={(e) => this.refreshState(e)}>
                        <IonRefresherContent />
                    </IonRefresher>
                    <IonGrid>{displayData}</IonGrid>
                </IonContent>
            </IonPage>
        );
    }
}

export default ChooseQuestionnaire;
