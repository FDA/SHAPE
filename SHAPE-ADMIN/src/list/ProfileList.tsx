import {
    IonItem,
    IonLabel,
    IonList,
    IonCol,
    IonCard,
    IonCardContent,
    IonRow
} from '@ionic/react';
import {isEmptyObject} from '../utils/Utils';
import {getUser} from '../utils/API';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {differenceInYears} from 'date-fns';
import Loading from '../layout/Loading';
import {Survey, Person} from '../interfaces/DataTypes';

interface ReduxProps {
    survey: Survey;
}

interface State {
    profileHTML: any;
    error: boolean;
    isLoading: boolean;
}

interface ProfileListPerson extends Person {
    participant: string;
}

class ProfileList extends Component<ReduxProps, State> {
    private _isMounted = false;
    constructor(props: any) {
        super(props);
        this.state = {
            profileHTML: <div />,
            error: false,
            isLoading: false
        };
    }

    load() {
        const parent = this;
        let profileHTML: any;
        let profileList: ProfileListPerson[] = [];
        let {survey} = this.props;

        if (!isEmptyObject(survey.participants)) {
            let {participants} = survey;
            let promises = participants.map((participantId: any) => {
                return new Promise((resolve, reject) => {
                    getUser(participantId)
                        .then(function (snapshot: any) {
                            snapshot.forEach(function (doc: any) {
                                let profiles = doc.data.profiles;
                                if (!isEmptyObject(profiles)) {
                                    for (var p in profiles) {
                                        profiles[p].participant =
                                            doc.data.participantId;
                                        profileList.push(profiles[p]);
                                    }
                                }
                            });
                            resolve();
                        })
                        .catch((err: any) => {
                            console.error(err);
                            parent.setState({isLoading: false, error: true});
                        });
                });
            });

            Promise.all(promises).then(() => {
                profileHTML = profileList.map((profile) => {
                    let {participant, id, dob, gender, name} = profile;
                    let age = differenceInYears(new Date(), new Date(dob));

                    return (
                        <IonItem key={id}>
                            <IonCol size="3">
                                <IonLabel>{participant}</IonLabel>
                            </IonCol>
                            <IonCol size="3">
                                <IonLabel>{id}</IonLabel>
                            </IonCol>
                            <IonCol size="3">
                                <IonLabel>{name}</IonLabel>
                            </IonCol>
                            <IonCol size="2">
                                <IonLabel>{gender}</IonLabel>
                            </IonCol>
                            <IonCol size="1">
                                <IonLabel>{age}</IonLabel>
                            </IonCol>
                        </IonItem>
                    );
                });
                if(parent._isMounted){
                    parent.setState({
                        profileHTML: profileHTML,
                        isLoading: false,
                        error: false
                    });
                }
            });
        } else {
            parent.setState({
                isLoading: false,
                error: false,
                profileHTML: (
                    <IonCard style={{textAlign: 'center'}}>
                        <IonCardContent>
                            No participants have been added by respondents, or
                            no respondents have been added to this survey.
                        </IonCardContent>
                    </IonCard>
                )
            });
        }
    }

    UNSAFE_componentWillReceiveProps() {
        this.setState({isLoading: true});
        this.load();
    }

    componentDidMount() {
        this._isMounted = true;
        this.setState({isLoading: true});
        this.load();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {
        let {isLoading} = this.state;

        return (
            <IonList>
                <IonItem color="light">
                    <IonCol size="3">
                        <IonLabel>Respondent ID</IonLabel>
                    </IonCol>
                    <IonCol size="3">
                        <IonLabel>ID</IonLabel>
                    </IonCol>
                    <IonCol size="3">
                        <IonLabel>Name</IonLabel>
                    </IonCol>
                    <IonCol size="2">
                        <IonLabel>Gender</IonLabel>
                    </IonCol>
                    <IonCol size="1">
                        <IonLabel>Age</IonLabel>
                    </IonCol>
                </IonItem>
                {isLoading && (
                    <IonRow text-center>
                        <IonCol size="12" style={{textAlign: 'center'}}>
                            <Loading />
                        </IonCol>
                    </IonRow>
                )}
                {this.state.profileHTML}
            </IonList>
        );
    }
}

// Map Redux state to component props
function mapStateToProps(state: any) {
    return {
        survey: state.survey
    };
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch: any) {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfileList);
