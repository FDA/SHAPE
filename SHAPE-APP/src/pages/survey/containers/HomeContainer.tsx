import React, { Component } from 'react';
import {
    Survey,
    User,
    FirebaseAuth,
    InformedConsent,
    Questionnaire,
    ParticipantResponse
} from '../../../interfaces/DataTypes';
import { RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { agreeToInformedConsent, setOrg } from '../../../redux/actions/Questionnaire';
import { refreshAll } from '../../../redux/actions/Participant';
import Home from '../Home';

interface PassedProps extends RouteComponentProps {
    profile: User;
    fireBaseAuth: FirebaseAuth;
    agreeToInformedConsentDispatch: Function;
    consent: Array<InformedConsent>;
    refreshAllDispatch: Function;
    surveys: Array<Survey>;
    loading: boolean;
    darkMode: boolean;
    firebaseLoggedIn: boolean;
    questionnaires: Array<Questionnaire>;
    setOrgDispatch: Function;
    participantResponse: ParticipantResponse[];
}

class HomeContainer extends Component<PassedProps, {}> {
    render() {
        const {
            profile,
            fireBaseAuth,
            agreeToInformedConsentDispatch,
            consent,
            refreshAllDispatch,
            surveys,
            loading,
            darkMode,
            firebaseLoggedIn,
            questionnaires,
            history,
            location,
            match,
            setOrgDispatch,
            participantResponse
        } = this.props;
        return (
            <Home
                profile={profile}
                fireBaseAuth={fireBaseAuth}
                agreeToInformedConsent={agreeToInformedConsentDispatch}
                consent={consent}
                refreshAll={refreshAllDispatch}
                surveys={surveys}
                loading={loading}
                darkMode={darkMode}
                firebaseLoggedIn={firebaseLoggedIn}
                questionnaires={questionnaires}
                history={history}
                location={location}
                match={match}
                setOrg={setOrgDispatch}
                participantResponse={participantResponse}
            />
        );
    }
}

const mapStateToProps = (state: any) => ({
    loading: state.loading,
    profile: state.firebase.profile,
    fireBaseAuth: state.firebase.auth,
    surveys: state.surveys,
    consent: state.consent,
    questionnaires: state.questionnaires,
    participantResponse: state.participantResponse
});

const mapDispatchToProps = (dispatch: any) => {
    return {
        agreeToInformedConsentDispatch(
            participantId: string,
            surveyId: string,
            email: string,
            org: string,
            userId: string
        ) {
            dispatch(agreeToInformedConsent(participantId, surveyId, email, org, userId));
        },
        refreshAllDispatch() {
            dispatch(refreshAll());
        },
        setOrgDispatch(org: string) {
            dispatch(setOrg(org));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeContainer);
