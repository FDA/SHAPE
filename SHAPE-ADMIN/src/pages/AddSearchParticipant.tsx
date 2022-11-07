import {
    IonList,
    IonButton,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonListHeader,
    IonCol,
    IonSearchbar,
    IonItem,
    IonLabel,
    IonCheckbox,
    IonCard,
    IonCardContent
} from '@ionic/react';
import { isEmptyObject } from '../utils/Utils';
import React, { Component } from 'react';
import { getAllParticipants } from '../utils/API';
import { connect } from 'react-redux';
import { updateSurvey } from '../redux/actions/Survey';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { cloneDeep } from 'lodash';
import { Survey, Participant } from '../interfaces/DataTypes';

interface ReduxProps extends RouteComponentProps {
    updateSurvey: Function;
    survey: Survey;
}

interface State {
    participantList: Array<Participant>;
    checkedList: Array<string>;
    searchText: string;
    finalSearchText: string;
}

class AddSearchParticipant extends Component<ReduxProps, State> {
    constructor(props: ReduxProps) {
        super(props);
        this.state = {
            participantList: [],
            checkedList: [],
            searchText: '',
            finalSearchText: ''
        };
    }

    handleChange = (e: any, participant: Participant) => {
        let tempList = this.state.checkedList;
        if (e.target.checked) {
            tempList.push(participant.participantId);
        } else {
            tempList = tempList.filter((elem: string) => {
                return elem !== participant.participantId;
            });
        }
        this.setState({ checkedList: tempList });
    };

    add = () => {
        let { survey } = this.props;
        let surveyId = survey.id;
        let participants = !isEmptyObject(survey.participants) ? cloneDeep(survey.participants) : [];

        let { checkedList } = this.state;

        for (let index in checkedList) {
            participants.push(checkedList[index]);
        }

        survey.participants = participants;

        this.props.updateSurvey(surveyId, survey);
        this.props.history.goBack();
    };

    handleSearchChange(text: string) {
        this.setState({ searchText: text });
    }

    load() {
        let { survey } = this.props;
        this.setState({
            participantList: [],
            checkedList: []
        });
        let participantList: Participant[] = [];
        let currentParticipants = !isEmptyObject(survey.participants) ? survey.participants : [];

        getAllParticipants()
            .then((snapshot: any) => {
                snapshot.forEach((doc: any) => {
                    let participant = doc.data;
                    // makes sure that you cannot select participant already added to your survey
                    if (currentParticipants.indexOf(participant.participantId) < 0) {
                        participantList.push(participant);
                    }
                });

                this.setState({
                    participantList: [...participantList].sort((p1: any, p2: any) =>
                        p1.participantId > p2.participantId ? 1 : -1
                    )
                });
            })
            .catch((err: any) => {
                console.error('Error getting documents', err);
            });
    }

    finalSearch() {
        let searchText = this.state.searchText;
        this.setState({ finalSearchText: searchText });
    }

    clear() {
        this.setState({ searchText: '', finalSearchText: '' });
    }

    componentDidMount() {
        this.load();
    }

    render = () => {
        let { participantList, searchText, finalSearchText } = this.state;

        return (
            <>
                <IonHeader aria-label='Search and Add'>
                    <IonToolbar>
                        <IonList>
                            <IonListHeader aria-label='Search and Add list'>
                                <IonCol size='3'>
                                    <IonTitle>Search and Add</IonTitle>
                                </IonCol>
                                <IonCol size='4'>
                                    <IonSearchbar
                                        value={searchText}
                                        onIonChange={(e: any) =>
                                            this.handleSearchChange(e.detail.value!)
                                        }></IonSearchbar>
                                </IonCol>
                                <IonCol size='1'>
                                    <IonButton onClick={() => this.finalSearch()}>Search</IonButton>
                                </IonCol>
                                <IonCol size='1'>
                                    <IonButton onClick={() => this.clear()} color='secondary'>
                                        Clear
                                    </IonButton>
                                </IonCol>
                                <IonCol size='3'>
                                    <IonButton fill='solid' onClick={() => this.add()}>
                                        Add Respondent(s)
                                    </IonButton>
                                </IonCol>
                            </IonListHeader>
                        </IonList>
                    </IonToolbar>
                </IonHeader>
                <IonList>
                    {isEmptyObject(finalSearchText) && (
                        <IonCard style={{ textAlign: 'center' }}>
                            <IonCardContent>Search to populate participants.</IonCardContent>
                        </IonCard>
                    )}
                    {!isEmptyObject(finalSearchText) &&
                        participantList
                            .filter((elem: Participant) => {
                                return elem.participantId
                                    .toLowerCase()
                                    .includes(finalSearchText.toLowerCase());
                            })
                            .map((participant: Participant) => {
                                return (
                                    <IonItem
                                        key={participant.participantId}
                                        color={!isEmptyObject(participant.optedOut) ? 'medium' : ''}>
                                        <IonLabel>
                                            {participant.participantId}{' '}
                                            {!isEmptyObject(participant.optedOut) ? ' (Opted Out}' : ''}
                                        </IonLabel>
                                        <IonCheckbox
                                            disabled={
                                                !isEmptyObject(participant.optedOut)
                                                    ? participant.optedOut
                                                    : false
                                            }
                                            slot='start'
                                            color='primary'
                                            title='Add Question'
                                            onClick={(e: any) => {
                                                this.handleChange(e, participant);
                                            }}
                                        />
                                    </IonItem>
                                );
                            })}
                </IonList>
            </>
        );
    };
}

function mapStateToProps(state: any) {
    return {
        survey: state.survey
    };
}

function mapDispatchToProps(dispatch: any) {
    return {
        updateSurvey(surveyId: string, survey: any) {
            dispatch(updateSurvey(surveyId, survey));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(AddSearchParticipant));
