import {
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonInput,
    IonLabel,
    IonText,
    IonList,
    IonItem,
    IonButton
} from '@ionic/react';
import React from 'react';
import { isEmptyObject } from '../utils/Utils';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { routes } from '../utils/Constants';
import { Questionnaire, Survey } from '../interfaces/DataTypes';
import { formatISO } from 'date-fns';
import { connect } from 'react-redux';
import { newQuestionnaire } from '../redux/actions/Questionnaire';

interface NewQuestionnaireProps extends RouteComponentProps {
    failure: boolean;
    description: string;
    name: string;
    subtitle: string;
    survey: Survey;
    newQuestionnaireDispatch: Function;
    loggedIn: boolean;
}

interface State {
    failure: boolean;
    description: string;
    name: string;
    subtitle: string;
}

class NewQuestionnaire extends React.Component<NewQuestionnaireProps, State> {
    constructor(props: NewQuestionnaireProps) {
        super(props);
        this.state = {
            failure: false,
            description: '',
            name: '',
            subtitle: ''
        };
    }

    setDescription(value: string) {
        this.setState({ description: value });
    }

    setName(value: string) {
        this.setState({ name: value });
    }

    setSubtitle(value: string) {
        this.setState({ subtitle: value });
    }

    componentDidMount() {
        let { loggedIn } = this.props;

        if (!loggedIn) {
            this.props.history.push(routes.LOGIN);
        }
    }

    submit = () => {
        var surveyId = this.props.survey.id;
        var isPublic = this.props.survey.public ? true : false;
        let { name, subtitle, description } = this.state;

        if (!isEmptyObject(name) && !isEmptyObject(subtitle) && !isEmptyObject(description)) {
            let questionnaire: Questionnaire = {
                surveyId: surveyId,
                name: name,
                shortDescription: subtitle,
                description: description,
                archived: false,
                open: false,
                dateCreated: formatISO(new Date()),
                public: isPublic
            };

            this.props.newQuestionnaireDispatch(questionnaire);

            this.setState({
                failure: false,
                description: '',
                name: '',
                subtitle: ''
            });

            this.props.history.push({
                pathname: `${routes.SURVEY}/${surveyId}`
            });
        } else {
            this.setState({ failure: true });
        }
    };

    render() {
        let { name, description, subtitle } = this.state;

        return (
            <IonPage>
                <IonHeader aria-label='Add New Questionnaire'>
                    <IonToolbar>
                        <IonButtons slot='start'>
                            <IonBackButton defaultHref={routes.HOME} />
                        </IonButtons>
                        <IonTitle>Add New Questionnaire</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <form>
                        <IonList lines='full' class='ion-no-margin ion-no-padding'>
                            <IonItem>
                                <IonLabel position='stacked'>
                                    Title<IonText color='danger'>*</IonText>
                                </IonLabel>
                                <IonInput
                                    value={name}
                                    placeholder='Questionnaire name'
                                    id='questionnaire-name'
                                    onIonChange={(e: any) => {
                                        this.setName(e.detail.value);
                                    }}
                                />
                            </IonItem>
                            <IonItem>
                                <IonLabel position='stacked'>
                                    Subtitle<IonText color='danger'>*</IonText>
                                </IonLabel>
                                <IonInput
                                    value={subtitle}
                                    placeholder='A short description'
                                    id='questionnaire-subtitle'
                                    onIonChange={(e: any) => {
                                        this.setSubtitle(e.detail.value);
                                    }}
                                />
                            </IonItem>
                            <IonItem>
                                <IonLabel position='stacked'>
                                    Description
                                    <IonText color='danger'>*</IonText>
                                </IonLabel>
                                <IonInput
                                    value={description}
                                    placeholder='Full description'
                                    id='questionnaire-description'
                                    onIonChange={(e: any) => {
                                        this.setDescription(e.detail.value);
                                    }}
                                />
                            </IonItem>
                        </IonList>
                        <IonButton size='small' fill='outline' onClick={this.submit}>
                            Submit
                        </IonButton>
                        {this.state.failure && (
                            <IonText color='danger'>All required fields are not filled.</IonText>
                        )}
                    </form>
                </IonContent>
            </IonPage>
        );
    }
}

function mapStateToProps(state: any) {
    return {
        survey: state.survey,
        loggedIn: state.authentication.loggedIn
    };
}

function mapDispatchToProps(dispatch: any) {
    return {
        newQuestionnaireDispatch(questionnaire: Questionnaire) {
            dispatch(newQuestionnaire(questionnaire));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(NewQuestionnaire));
