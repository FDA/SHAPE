import {
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonLabel,
    IonText
} from '@ionic/react';
import React, { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { isEmptyObject, getColor } from '../utils/Utils';
import { format } from 'date-fns';
import { storeQuestionnaireList } from '../redux/actions/Questionnaire';
import { storeSurvey } from '../redux/actions/Survey';
import { Survey, AdminUser } from '../interfaces/DataTypes';
import { routes, dateFormats } from '../utils/Constants';

interface ReduxProps {
    survey: Survey;
    storeQuestionnaireListDispatch: Function;
    storeSurveyDispatch: Function;
    profile: AdminUser;
}

interface SurveyCardProps {
    showModal: boolean;
    isLoading: boolean;
    error: boolean;
}

class SurveyCard extends Component<ReduxProps & RouteComponentProps, SurveyCardProps> {
    openSurvey(surveyId: string) {
        this.props.history.push({ pathname: `${routes.SURVEY}/${surveyId}` });
        // store list of questionnaires in redux
        this.props.storeSurveyDispatch(surveyId);
        this.props.storeQuestionnaireListDispatch(surveyId);
    }

    getTextColor(open: boolean, locked: boolean) {
        if (open) return 'success';
        else if (locked) return 'secondary';
        else return 'tertiary';
    }

    getOpenText(open: boolean, locked: boolean) {
        if (open) return 'Open';
        else if (locked) return 'Closed';
        else return 'Draft';
    }

    getAccessText(pub: boolean) {
        if (pub) return 'Public';
        else return 'Private';
    }

    render() {
        const { survey, profile } = this.props;
        return (
            <IonCard
                button={true}
                aria-label={`Go to Survey ${survey.name}`}
                onClick={() => this.openSurvey(survey.id)}>
                <IonCardHeader style={{ backgroundColor: getColor(survey.open, survey.locked) }}>
                    <IonCardTitle>{survey.name}</IonCardTitle>
                    <IonCardSubtitle>{survey.shortDescription}</IonCardSubtitle>
                </IonCardHeader>
                <IonCardContent style={{ padding: '16px' }}>
                    <IonLabel color='primary'>Access:</IonLabel>{' '}
                    <IonText>{this.getAccessText(survey.public)}</IonText>
                    <br />
                    <IonLabel color='primary'>Status:</IonLabel>{' '}
                    <IonText color={this.getTextColor(survey.open, survey.locked)}>
                        {this.getOpenText(survey.open, survey.locked)}
                    </IonText>
                    <br />
                    <IonLabel color='primary'>Date Created: </IonLabel>
                    <IonText>
                        {!isEmptyObject(survey.dateCreated)
                            ? format(new Date(survey.dateCreated), dateFormats.MMddyyZYYHHmmss)
                            : 'N/A'}
                    </IonText>
                    {profile.org === 'ALL' && (
                        <p>
                            <IonLabel color='primary'>Organization: </IonLabel>
                            <IonText>{survey.org}</IonText>
                        </p>
                    )}
                </IonCardContent>
            </IonCard>
        );
    }
}

// Map Redux state to component props
function mapStateToProps(state: any) {
    return {
        profile: state.firebase.profile
    };
}

function mapDispatchToProps(dispatch: any) {
    return {
        storeQuestionnaireListDispatch(surveyId: string) {
            dispatch(storeQuestionnaireList(surveyId));
        },
        storeSurveyDispatch(surveyId: string) {
            dispatch(storeSurvey(surveyId));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(SurveyCard));
