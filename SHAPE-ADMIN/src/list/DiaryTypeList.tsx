import {
    IonItem,
    IonLabel,
    IonList,
    IonCol,
    IonButton,
    IonCard,
    IonTitle,
    IonCardContent,
    IonText,
    IonRow
} from '@ionic/react';

import {isEmptyObject} from '../utils/Utils';
import {
    getDiaryJSONExport,
    getDiaryFHIRExport,
    getDiaryResponses
} from '../utils/API';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import Loading from '../layout/Loading';
import {Survey, DiaryResponse} from '../interfaces/DataTypes';

interface ReduxProps {
    survey: Survey;
}

interface State {
    diaryResponses: Array<DiaryResponse>;
    isLoading: boolean;
    error: boolean;
}

class DiaryTypeList extends Component<ReduxProps, State> {
    private _isMounted = false;

    constructor(props: ReduxProps) {
        super(props);

        this.state = {
            diaryResponses: [],
            isLoading: false,
            error: false
        };
    }

    componentDidMount() {
        this._isMounted = true;
        this.setState({isLoading: true});
        this.getDiaryResponses();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    getDiaryResponses = () => {
        let {id} = this.props.survey;
        getDiaryResponses(id)
            .then((res: any) => {
                let diaryResponses: Array<DiaryResponse> = [];
                res.forEach((doc: any) => {
                    let temp = doc.data;
                    temp.id = doc.id;
                    diaryResponses.push(temp);
                });
                if(this._isMounted){
                    this.setState({
                        diaryResponses,
                        isLoading: false,
                        error: false
                    });
                }
            })
            .catch((err: any) => {
                console.error(err);
                if(this._isMounted){
                    this.setState({
                        isLoading: false,
                        error: true
                    });
                }
            });
    };

    processDownload = (response: any) => {
        const fileName = `${this.props.survey.name}_diary_responses`;
        const json = JSON.stringify(response, null, 2);
        const blob = new Blob([json], {type: 'application/json'});
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = fileName + '.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    downloadJSONFile = async () => {
        getDiaryJSONExport(this.props.survey.id)
            .then(async (response: any) => {
                this.processDownload(response);
            })
            .catch((err) => {
                console.error(err);
            });
    };

    downloadFile = async () => {
        getDiaryFHIRExport(this.props.survey.id)
            .then(async (response: any) => {
                this.processDownload(response);
            })
            .catch((err) => {
                console.error(err);
            });
    };

    getResponsesPanel = () => {
        let {diaryResponses, isLoading, error} = this.state;
        return (
            <IonList style={{padding: '16px'}}>
                <IonItem color="light">
                    <IonCol size="2">
                        <IonLabel>Participant Id</IonLabel>
                    </IonCol>
                    <IonCol size="2">
                        <IonLabel>Profile Name</IonLabel>
                    </IonCol>
                    <IonCol size="2">
                        <IonLabel>Health Event</IonLabel>
                    </IonCol>
                    <IonCol size="4">
                        <IonLabel>Date Written</IonLabel>
                    </IonCol>
                </IonItem>
                {isLoading && (
                    <IonRow text-center>
                        <IonCol size="12" style={{textAlign: 'center'}}>
                            <Loading />
                        </IonCol>
                    </IonRow>
                )}
                {error && (
                    <IonCard style={{textAlign: 'center'}}>
                        <IonCardContent>
                            <IonText color="danger">
                                Error loading questionnaires. Try refreshing.
                            </IonText>
                        </IonCardContent>
                    </IonCard>
                )}
                {isEmptyObject(diaryResponses) && !isLoading && (
                    <IonCard style={{textAlign: 'center'}}>
                        <IonCardContent>
                            No diary responses are currently available.
                        </IonCardContent>
                    </IonCard>
                )}
                {diaryResponses.map((n: any) => {
                    return (
                        <IonItem key={n.id}>
                            <IonCol size="2">
                                <IonLabel>{n.participantId}</IonLabel>
                            </IonCol>
                            <IonCol size="2">
                                <IonLabel>{n.profileName}</IonLabel>
                            </IonCol>
                            <IonCol size="2">
                                <IonLabel>{n.formType}</IonLabel>
                            </IonCol>
                            <IonCol size="2">
                                <IonLabel>{n.dateWritten.toString()}</IonLabel>
                            </IonCol>
                        </IonItem>
                    );
                })}
            </IonList>
        );
    };

    render() {
        return (
            <>
                <IonCard>
                    <IonTitle class="ion-text-center" style={{padding: '16px'}}>
                        Responses
                    </IonTitle>
                    <IonButton
                        style={{marginLeft: '16px'}}
                        onClick={(e: any) => {
                            e.preventDefault();
                            e.stopPropagation();
                            this.downloadJSONFile();
                        }}>
                        Download Responses (JSON)
                    </IonButton>
                    <IonButton
                        style={{marginLeft: '16px'}}
                        onClick={(e: any) => {
                            e.preventDefault();
                            e.stopPropagation();
                            this.downloadFile();
                        }}>
                        Download Responses (FHIR)
                    </IonButton>
                    {this.getResponsesPanel()}
                </IonCard>
            </>
        );
    }
}

// Map Redux state to component props
function mapStateToProps(state: any) {
    return {
        survey: state.survey,
        authentication: state.authentication
    };
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch: any) {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(DiaryTypeList);
