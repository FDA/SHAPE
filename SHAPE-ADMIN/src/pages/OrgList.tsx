import React from 'react';
import {Redirect, RouteComponentProps} from 'react-router';
import {
    IonButton,
    IonCheckbox,
    IonCol,
    IonContent,
    IonFab,
    IonFabButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonPage,
    IonRow,
    IonText
} from '@ionic/react';
import AppHeader from '../layout/AppHeader';
import {add, arrowBackOutline} from 'ionicons/icons';
import {connect} from 'react-redux';
import {getAllOrgs, updateOrg} from '../utils/API';
import {Org, User} from '../interfaces/DataTypes';
import Loading from '../layout/Loading';
import {routes} from '../utils/Constants';

interface Props extends RouteComponentProps {
    profile: User;
}

interface State {
    orgList: Array<Org>;
    error: boolean;
    isLoading: boolean;
}

class OrgList extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            orgList: [],
            error: false,
            isLoading: false
        };
    }
    handleRowClick = (org: Org) => {
        // @ts-ignore
        const qs = Object.keys(org)
            //@ts-ignore
            .map((key) => key + '=' + org[key])
            .join('&');
        this.props.history.push({
            pathname: routes.ORG_ADD,
            search: `?${qs}`
        });
    };
    handleFABClick = () => {
        this.props.history.push({
            pathname: routes.ORG_ADD,
            search: null
        });
    };
    toggleEnabled = (org: Org) => {
        org.active = !org.active;
        updateOrg(org.docId, org);
        this.getAllOrgs();
    };

    getAllOrgs = () => {
        let orgs: Org[] = [];
        this.setState({isLoading: true});
        let parent = this;
        getAllOrgs().then(function (snapshot: any) {
            snapshot.forEach(function (doc: any) {
                let org = doc.data();
                org.docId = doc.id;
                if (org) {
                    orgs.push(org);
                }
                parent.setState({orgList: orgs, isLoading: false});
            });
        });
    };

    UNSAFE_componentWillReceiveProps(nextProps: Readonly<Props>): void {
        const refresh = nextProps.location.state.refresh;
        if (refresh) {
            this.getAllOrgs();
        }
    }

    componentDidMount(): void {
        this.getAllOrgs();
    }

    render() {
        const {profile} = this.props;
        const {isLoading, orgList} = this.state;
        const superUser = profile && profile.org && profile.org === 'ALL';
        // Guard route against admins that are not superuser
        if (!superUser) {
            return <Redirect to={routes.HOME} />;
        }
        return (
            <IonPage>
                <AppHeader />
                <IonContent className="ion-padding">
                    <IonRow>
                        <IonCol>
                            <span style={{float: 'left'}}>
                                <IonFabButton
                                    style={{'--box-shadow': 'none'}}
                                    color="light"
                                    size="small"
                                    href="/home">
                                    <IonIcon icon={arrowBackOutline}></IonIcon>
                                </IonFabButton>
                                <h1>Manage Organizations</h1>
                            </span>
                        </IonCol>
                    </IonRow>
                    <IonRow>
                        <IonCol>
                            <IonText className="ion-text-center">
                                Manage Organizations
                            </IonText>
                        </IonCol>
                    </IonRow>
                    <IonRow>
                        <IonList style={{width: '100%'}}>
                            <IonItem color="light">
                                <IonCol size="2">
                                    <IonLabel>Org ID</IonLabel>
                                </IonCol>
                                <IonCol size="2">
                                    <IonLabel>Org Name</IonLabel>
                                </IonCol>
                                <IonCol size="2">
                                    <IonLabel>Contact Name</IonLabel>
                                </IonCol>
                                <IonCol size="2">
                                    <IonLabel>Admin Email</IonLabel>
                                </IonCol>
                                <IonCol size="2">
                                    <IonLabel>Active</IonLabel>
                                </IonCol>
                                <IonCol size="1">
                                    <IonLabel>Toggle Active</IonLabel>
                                </IonCol>
                                <IonCol size="1">
                                    <IonLabel>Remove</IonLabel>
                                </IonCol>
                            </IonItem>
                            {isLoading && (
                                <IonRow text-center>
                                    <IonCol
                                        size="12"
                                        style={{textAlign: 'center'}}>
                                        <Loading />
                                    </IonCol>
                                </IonRow>
                            )}
                            {orgList.map((org: Org) => {
                                return (
                                    <IonItem key={org.id}>
                                        <IonCol size="2">
                                            <IonLabel>{org.id}</IonLabel>
                                        </IonCol>
                                        <IonCol
                                            size="2"
                                            style={{cursor: 'pointer'}}
                                            onClick={() => {
                                                this.handleRowClick(org);
                                            }}>
                                            <IonLabel>{org.name}</IonLabel>
                                        </IonCol>
                                        <IonCol size="2">
                                            <IonLabel>
                                                {org.contactName}
                                            </IonLabel>
                                        </IonCol>
                                        <IonCol size="2">
                                            <IonLabel>
                                                {org.adminEmail}
                                            </IonLabel>
                                        </IonCol>
                                        <IonCol size="2">
                                            <IonCheckbox
                                                id={`${org.id}-cb`}
                                                color="primary"
                                                checked={org.active}
                                                disabled={true}
                                            />
                                        </IonCol>
                                        <IonCol size="1">
                                            {org.active && (
                                                <IonButton
                                                    style={{width: '100px'}}
                                                    expand="block"
                                                    onClick={() =>
                                                        this.toggleEnabled(org)
                                                    }>
                                                    Disable
                                                </IonButton>
                                            )}
                                            {!org.active && (
                                                <IonButton
                                                    style={{width: '100px'}}
                                                    expand="block"
                                                    onClick={() =>
                                                        this.toggleEnabled(org)
                                                    }>
                                                    Enable
                                                </IonButton>
                                            )}
                                        </IonCol>
                                        <IonCol size="1">
                                            <IonButton
                                                style={{width: '100px'}}
                                                expand="block"
                                                color="danger"
                                                onClick={() =>
                                                    alert('Not yet Implemented')
                                                }>
                                                Remove
                                            </IonButton>
                                        </IonCol>
                                    </IonItem>
                                );
                            })}
                        </IonList>
                    </IonRow>
                    <IonFab vertical="bottom" horizontal="end" slot="fixed">
                        <IonFabButton onClick={this.handleFABClick}>
                            <IonIcon icon={add} />
                        </IonFabButton>
                    </IonFab>
                </IonContent>
            </IonPage>
        );
    }
}

function mapStateToProps(state: any) {
    return {
        profile: state.firebase.profile
    };
}

export default connect(mapStateToProps)(OrgList);
