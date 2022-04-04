import React from 'react';
import {IonButton} from '@ionic/react';
import {connect} from 'react-redux';
import {isEmptyObject} from '../../utils/Utils';
import {getEnvVar} from '../../utils/API';
import firebase from '../../config/fb';
import {Questionnaire} from '../../interfaces/DataTypes';

interface StateProps {
    previewUrl: string;
    token?: string;
}

interface ReduxProps {
    questionnaire: Questionnaire;
    firebase: any;
}

class PreviewButton extends React.Component<ReduxProps, StateProps> {
    containerEl: any;
    externalWindow: any;

    constructor(props: ReduxProps) {
        super(props);
        this.state = {
            token: '',
            previewUrl: ''
        };
        this.containerEl = document.createElement('div');
        this.externalWindow = null;
    }

    componentDidMount() {
        const currentUser = firebase.auth().currentUser;
        if (currentUser != null) {
            currentUser.getIdToken(true).then((token: any) => {
                this.setState({token: token});
            });
        }
    }

    getPreviewLink = () => {
        let data = {
            key: 'shape_preview_url'
        };
        let context = {};
        return getEnvVar(data, context);
    };

    openPreview = async () => {
        let {previewUrl} = this.state;
        if (this.props.questionnaire.questions.length < 1) {
            alert('This questionnaire has no questions.');
            return;
        }
        if (isEmptyObject(previewUrl)) {
            this.getPreviewLink()
                .then((res: any) => {
                    this.setState({
                        previewUrl: res.data.shape_preview_url.value
                    });
                })
                .then(() => this.renderWindow())
                .catch((e: any) => {
                    console.error(e);
                });
        } else {
            this.renderWindow();
        }
    };

    renderWindow() {
        const {surveyId} = this.props.questionnaire;
        const {previewUrl, token} = this.state;
        const encoded_token = btoa(JSON.stringify(token));
        const questionnaireId = this.props.questionnaire.id;

        const combinedUrl = `${previewUrl}/preview-questionnaire/survey/${surveyId}/questionnaire/${questionnaireId}/token/${encoded_token}`;
        const winFeature =
            'width=400,height=828,left=200,top=200,location=no,toolbar=no,menubar=no,scrollbars=no,resizable=no';
        this.externalWindow = window.open('', '', winFeature);
        this.externalWindow.document.body.style.cssText =
            'margin-top: 12px; margin-bottom: 12px; margin-left: 12px; margin-right:12px';
        this.externalWindow.location.replace(combinedUrl);
        this.externalWindow.document.body.appendChild(this.containerEl);
    }

    render() {
        return (
            <IonButton
                color="tertiary"
                fill="clear"
                onClick={() => this.openPreview()}>
                Preview
            </IonButton>
        );
    }
}

function mapStateToProps(state: any) {
    return {
        questionnaire: state.questionnaire,
        firebase: state.firebase
    };
}

export default connect(mapStateToProps)(PreviewButton);
