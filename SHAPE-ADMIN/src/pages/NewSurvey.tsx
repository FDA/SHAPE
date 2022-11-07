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
    IonButton,
    IonTextarea,
    IonRadio,
    IonRadioGroup,
    IonListHeader
} from '@ionic/react';
import React from 'react';
import { connect } from 'react-redux';
import { isEmptyObject } from '../utils/Utils';
import { Survey } from '../interfaces/DataTypes';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { createSurvey } from '../utils/API';
import { formatISO } from 'date-fns';
import { newSurvey } from '../redux/actions/Survey';
import { routes } from '../utils/Constants';

interface ReduxProps extends RouteComponentProps {
    newSurvey: Survey;
    newSurveyDispatch: Function;
    loggedIn: boolean;
}

interface State {
    failure: boolean;
    name: string;
    subtitle: string;
    description: string;
    informedConsent: string;
    publicAccess: boolean;
}

class NewSurvey extends React.Component<ReduxProps, State> {
    constructor(props: ReduxProps) {
        super(props);
        this.state = {
            failure: false,
            name: '',
            subtitle: '',
            description: '',
            informedConsent: '',
            publicAccess: false
        };
    }

    componentDidMount() {
        let { loggedIn } = this.props;

        if (!loggedIn) {
            this.props.history.push(routes.LOGIN);
        }
    }

    setName = (value: string) => {
        this.setState({ name: value });
    };
    setDescription = (value: string) => {
        this.setState({ description: value });
    };
    setSubtitle = (value: string) => {
        this.setState({ subtitle: value });
    };
    setInformedConsent = (value: string) => {
        this.setState({ informedConsent: value });
    };
    setChecked = (checked: boolean) => {
        this.setState({ publicAccess: checked });
    };

    render() {
        let { name, subtitle, description, informedConsent, publicAccess } = this.state;

        const submit = (e: any) => {
            if (
                !isEmptyObject(name) &&
                !isEmptyObject(subtitle) &&
                !isEmptyObject(description) &&
                !isEmptyObject(informedConsent)
            ) {
                let survey: Survey = {
                    name: name,
                    shortDescription: subtitle,
                    description: description,
                    informedConsent: informedConsent,
                    open: false,
                    archived: false,
                    dateCreated: formatISO(new Date()),
                    public: publicAccess
                };

                createSurvey(survey)
                    .then(async (resp: any) => {
                        const res = await resp.json();
                        let id = res.DATA.id;
                        let data = { ...survey, id: id };

                        this.props.newSurveyDispatch(data);

                        this.setState({
                            failure: false,
                            name: '',
                            subtitle: '',
                            description: '',
                            informedConsent: '',
                            publicAccess: false
                        });
                        this.props.history.push(routes.HOME);
                    })
                    .catch((err: any) => {
                        console.error(err);
                    });
            } else {
                this.setState({ failure: true });
            }
        };

        return (
            <IonPage>
                <IonHeader aria-label='Add New Survey'>
                    <IonToolbar>
                        <IonButtons slot='start'>
                            <IonBackButton defaultHref={routes.HOME} />
                        </IonButtons>
                        <IonTitle>Add New Survey</IonTitle>
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
                                    placeholder='Survey name'
                                    id='s-name'
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
                                    id='s-subtitle'
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
                                    id='s-description'
                                    onIonChange={(e: any) => {
                                        this.setDescription(e.detail.value);
                                    }}
                                />
                            </IonItem>
                            <IonItem>
                                <IonLabel position='stacked'>
                                    Informed Consent
                                    <IonText color='danger'>*</IonText>
                                </IonLabel>
                                <IonTextarea
                                    value={informedConsent}
                                    rows={6}
                                    cols={20}
                                    placeholder='Informed consent...'
                                    id='s-informed-consent'
                                    onIonChange={(e: any) => {
                                        this.setInformedConsent(e.detail.value);
                                    }}
                                />
                            </IonItem>
                        </IonList>
                        <IonRadioGroup
                            value={publicAccess}
                            onClick={(e: any) => this.setChecked(e.target.value)}>
                            <IonListHeader>
                                <IonLabel>
                                    Access
                                    <p>
                                        Private access limits survey access to individuals invited by the
                                        organization. Public access allows any SHAPE user to access and
                                        participate in the survey.
                                    </p>
                                </IonLabel>
                            </IonListHeader>
                            <IonItem>
                                <IonRadio slot='start' value={false} />
                                <IonLabel>Private</IonLabel>
                            </IonItem>
                            <IonItem>
                                <IonRadio slot='start' value={true} />
                                <IonLabel>Public</IonLabel>
                            </IonItem>
                        </IonRadioGroup>
                        <IonButton size='small' fill='outline' onClick={submit}>
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
        loggedIn: state.authentication.loggedIn
    };
}

function mapDispatchToProps(dispatch: any) {
    return {
        newSurveyDispatch(survey: any) {
            dispatch(newSurvey(survey));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(NewSurvey));
