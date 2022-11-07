import React, { Component, SyntheticEvent } from 'react';
import { Redirect, RouteComponentProps } from 'react-router-dom';
import {
    IonCol,
    IonContent,
    IonGrid,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonPage,
    IonRow,
    IonText
} from '@ionic/react';
import { Person, ParticipantResponse, FirebaseAuth, Questionnaire, User } from '../../interfaces/DataTypes';
import AppHeader from '../layout/AppHeader';
import { personSharp } from 'ionicons/icons';
import { routes } from '../../utils/Constants';
import { profilesWithCompletedResponse, profilesWithNoCompletedResponse } from '../../utils/Utils';

interface PassedProps extends RouteComponentProps {
    questionnaires: Array<Questionnaire>;
    profile: User;
    questionnaireView: string;
    participantResponse: ParticipantResponse[];
    setActiveProfile: Function;
    initializeQuestionnaire: Function;
    fireBaseAuth: FirebaseAuth;
}

interface ChooseProfileState {
    surveyId: string;
    questionnaireId: string;
}

class ChooseProfile extends Component<PassedProps, ChooseProfileState> {
    constructor(props: PassedProps) {
        super(props);
        this.state = {
            //@ts-ignore
            surveyId: props.match.params.id,
            //@ts-ignore
            questionnaireId: props.match.params.q13id
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps: Readonly<PassedProps>): void {
        this.setState({
            //@ts-ignore
            surveyId: nextProps.match.params.id,
            //@ts-ignore
            questionnaireId: nextProps.match.params.q13id
        });
    }

    onClick = (event: SyntheticEvent, participantProfile: Person, hrefUrl: string): void => {
        event.preventDefault();
        const { questionnaireId, surveyId } = this.state;
        const { questionnaires } = this.props;
        const selected = questionnaires.find((ele: Questionnaire) => {
            return ele.id === questionnaireId;
        });
        if (selected) {
            const { profile, participantResponse } = this.props;
            const target = {
                surveyId: surveyId,
                questionnaireId: questionnaireId,
                participantId: profile.participantId,
                profileName: participantProfile.name
            };
            this.props.setActiveProfile(participantProfile);
            this.props.initializeQuestionnaire(target, participantResponse);

            this.props.history.push(hrefUrl);
            document.getElementById('tabBar')!.style.display = 'none';
        }
    };

    render() {
        const { isEmpty } = this.props.fireBaseAuth;
        const { questionnaireId, surveyId } = this.state;
        const { questionnaireView, participantResponse, profile } = this.props;

        const filteredProfiles =
            questionnaireView === 'todo'
                ? profilesWithNoCompletedResponse(questionnaireId, participantResponse, profile)
                : profilesWithCompletedResponse(questionnaireId, participantResponse, profile);

        if (isEmpty) return <Redirect to={routes.LOGIN} />;
        return (
            <IonPage>
                <AppHeader showHeader={true} text={'Select Participant'} />
                <IonContent className='ion-padding'>
                    {questionnaireView === 'todo' && (
                        <IonText>Select from the participants below to complete this questionnaire:</IonText>
                    )}
                    {questionnaireView === 'complete' && (
                        <IonText>Select from the participants below to view their answers:</IonText>
                    )}
                    <IonList>
                        {filteredProfiles.map((participantProfile: Person) => {
                            const hrefUrl = `${routes.DO_QUESTIONNAIRE}/survey/${surveyId}/questionnaire/${questionnaireId}`;
                            return (
                                <IonItem
                                    key={participantProfile.id}
                                    detail={true}
                                    onClick={(e: any) => this.onClick(e, participantProfile, hrefUrl)}
                                    routerLink={hrefUrl}>
                                    <IonLabel>
                                        <IonGrid className='ion-no-padding'>
                                            <IonRow className='ion-align-items-center'>
                                                <IonCol className='ion-no-padding' style={{ flexGrow: 0 }}>
                                                    <IonIcon
                                                        icon={personSharp}
                                                        style={{
                                                            float: 'left',
                                                            marginRight: '8px',
                                                            zoom: 2.0
                                                        }}
                                                        aria-label={'profile icon'}
                                                    />
                                                </IonCol>
                                                <IonCol>
                                                    <h1>{participantProfile.name}</h1>
                                                    <div style={{ padding: '2px' }}>
                                                        Gender: {participantProfile.gender}
                                                    </div>
                                                    <div style={{ padding: '2px' }}>
                                                        DOB:{participantProfile.dob}
                                                    </div>
                                                </IonCol>
                                            </IonRow>
                                        </IonGrid>
                                    </IonLabel>
                                </IonItem>
                            );
                        })}
                    </IonList>
                </IonContent>
            </IonPage>
        );
    }
}

export default ChooseProfile;
