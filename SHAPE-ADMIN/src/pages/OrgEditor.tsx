import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Redirect, RouteComponentProps, withRouter} from 'react-router';
import {
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonItem,
    IonList,
    IonMenu,
    IonPage,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import NewOrg from './NewOrg';
import {isEmptyObject} from '../utils/Utils';
import {Organization, AdminUser} from '../interfaces/DataTypes';
import {routes} from '../utils/Constants';

interface Props extends RouteComponentProps {
    profile: AdminUser;
}

interface State {
    mode: string;
    org: Organization;
}

class OrgEditor extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            mode: 'add',
            org: null
        };
    }
    UNSAFE_componentWillReceiveProps(nextProps: Readonly<Props>): void {
        const {location} = nextProps;
        if (location.search) {
            const obj = mapQueryStringToObject(location);
            if (!isEmptyObject(obj)) {
                this.setState({mode: 'edit', org: obj});
            }
        } else {
            this.setState({mode: 'add', org: null});
        }
    }

    render() {
        const {profile} = this.props;
        const superUser = profile && profile.org && profile.org === 'ALL';
        // Guard route against admins that are not superuser
        if (!superUser) {
            return <Redirect to={routes.HOME} />;
        }
        const {mode, org} = this.state;
        const modeLabel =
            mode === 'add' ? 'Add Organization' : 'Edit Organization';

        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonBackButton defaultHref={routes.HOME} />
                        </IonButtons>
                        <IonTitle>{modeLabel}</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <IonMenu
                        type="overlay"
                        disabled={false}
                        contentId="topLevel">
                        <IonHeader>
                            <IonToolbar>
                                <IonTitle>Actions</IonTitle>
                            </IonToolbar>
                        </IonHeader>
                        <IonContent>
                            <IonList>
                                <IonItem>Create New Organization</IonItem>
                            </IonList>
                        </IonContent>
                    </IonMenu>
                    <IonContent id="topLevel">
                        <NewOrg org={org} />
                    </IonContent>
                </IonContent>
            </IonPage>
        );
    }
}

function mapQueryStringToObject(location: any) {
    var search = location.search.substring(1);
    return JSON.parse(
        '{"' +
            decodeURI(search)
                .replace(/"/g, '\\"')
                .replace(/&/g, '","')
                .replace(/=/g, '":"') +
            '"}'
    );
}

function mapStateToProps(state: any) {
    return {
        profile: state.firebase.profile
    };
}

export default connect(mapStateToProps)(withRouter(OrgEditor));
