import React, {Component} from 'react';
import {
    IonButton,
    IonCheckbox,
    IonCol,
    IonContent,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonRow,
    IonText
} from '@ionic/react';
import {isEmptyObject} from '../utils/Utils';
import {
    addOrg,
    checkUserExists,
    createAdminUser,
    setAdmin,
    updateOrg
} from '../utils/API';
import {RouteComponentProps, withRouter} from 'react-router-dom';
import Loading from '../layout/Loading';
import {routes} from '../utils/Constants';
import {Organization} from '../interfaces/DataTypes';

interface Props extends RouteComponentProps {
    org: Organization;
}

interface State {
    docId: string;
    id: string;
    orgName: string;
    contactName: string;
    adminEmail: string;
    active: boolean;
    mode: string;
    isLoading: boolean;
}

class NewOrg extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            docId: '',
            id: '',
            orgName: '',
            contactName: '',
            adminEmail: '',
            active: true,
            mode: 'add',
            isLoading: false
        };
    }

    updateOrganization = async (org: Organization) => {
        const {docId} = this.state;
        updateOrg(docId, org);
        this.setState({isLoading: false});
        this.props.history.push({
            pathname: routes.ORG_LIST,
            state: {refresh: true}
        });
    };

    makeUserAdmin = async (email: any, org: Organization) => {
        const admin = await setAdmin(email, org.id);
        const {data} = admin;
        if (data) {
            const {success} = data;
            if (success) {
                alert(`${org.contactName} has been made admin for ${org.name}`);
            }
        }
    };

    createAdmin = async (org: any) => {
        const createdAdmin = await createAdminUser(org);
        if (createdAdmin) {
            const admin = await setAdmin(org.adminEmail, org.id);
            const {data} = admin;
            if (data) {
                const {success} = data;
                if (success) {
                    alert(
                        `An account has been created for ${org.contactName} and is now admin for ${org.name}.`
                    );
                }
            }
        }
    };

    createOrg = async (org: Organization) => {
        const adminUser = await checkUserExists(org.adminEmail);
        const {email} = adminUser;
        if (email) {
            this.makeUserAdmin(email, org);
        } else {
            this.createAdmin(org);
        }
        await addOrg(org);
        this.setState({isLoading: false});
        this.props.history.push({
            pathname: routes.ORG_LIST,
            state: {refresh: true}
        });
    };

    submit = async (e: any) => {
        this.setState({isLoading: true});
        const {id, orgName, contactName, adminEmail, active, mode} = this.state;
        const org = {
            id: id,
            name: orgName,
            contactName: contactName,
            adminEmail: adminEmail,
            active: active,
            org: id
        };

        // if org is empty terminate everything
        if (
            isEmptyObject(org.id) ||
            isEmptyObject(org.name) ||
            isEmptyObject(org.contactName) ||
            isEmptyObject(org.adminEmail) ||
            isEmptyObject(org.active)
        ) {
            this.setState({isLoading: false});
            alert('All Fields are required!');
        } else {
            if (mode === 'add') {
                this.createOrg(org);
            } else {
                this.updateOrganization(org);
            }
        }
    };

    handleChange(event: any) {
        const {name, value} = event.target;
        //@ts-ignore
        this.setState({
            [name]: value
        });
    }

    UNSAFE_componentWillReceiveProps(
        nextProps: Readonly<any>,
        nextContext: any
    ): void {
        const {org} = nextProps;
        if (org && !isEmptyObject(org)) {
            this.setState({
                docId: org.docId,
                id: org.id,
                orgName: org.name,
                contactName: org.contactName,
                adminEmail: org.adminEmail,
                active: org.active,
                mode: 'edit'
            });
        } else {
            this.setState({
                docId: '',
                id: '',
                orgName: '',
                contactName: '',
                adminEmail: '',
                active: true,
                mode: 'add'
            });
        }
    }

    render() {
        const {
            id,
            orgName,
            contactName,
            adminEmail,
            active,
            mode,
            isLoading
        } = this.state;

        return (
            <IonContent>
                <form>
                    <IonList lines="full" class="ion-no-margin ion-no-padding">
                        <IonItem>
                            <IonLabel position="stacked">
                                Organization ID
                                <IonText color="danger">*</IonText>
                            </IonLabel>
                            <IonInput
                                placeholder=""
                                id="id"
                                disabled={mode === 'edit'}
                                value={id}
                                name="id"
                                onIonInput={(e) =>
                                    this.handleChange(e)
                                }></IonInput>
                        </IonItem>
                        <IonItem>
                            <IonLabel position="stacked">
                                Organization Name
                                <IonText color="danger">*</IonText>
                            </IonLabel>
                            <IonInput
                                placeholder=""
                                id="orgName"
                                value={orgName}
                                name="orgName"
                                onIonInput={(e) =>
                                    this.handleChange(e)
                                }></IonInput>
                        </IonItem>
                        <IonItem>
                            <IonLabel position="stacked">
                                Contact Name
                                <IonText color="danger">*</IonText>
                            </IonLabel>
                            <IonInput
                                placeholder=""
                                id="contactName"
                                value={contactName}
                                name="contactName"
                                onIonInput={(e) =>
                                    this.handleChange(e)
                                }></IonInput>
                        </IonItem>
                        <IonItem>
                            <IonLabel position="stacked">
                                Admin Email
                                <IonText color="danger">*</IonText>
                            </IonLabel>
                            <IonInput
                                placeholder=""
                                id="adminEmail"
                                value={adminEmail}
                                name="adminEmail"
                                onIonInput={(e) =>
                                    this.handleChange(e)
                                }></IonInput>
                        </IonItem>
                        <IonItem>
                            <IonLabel position="stacked">
                                Active<IonText color="danger">*</IonText>
                            </IonLabel>
                            <IonCheckbox
                                id={'active'}
                                color="primary"
                                checked={active}
                                disabled={true}
                            />
                        </IonItem>
                        {isLoading && (
                            <IonRow text-center>
                                <IonCol size="12" style={{textAlign: 'center'}}>
                                    <Loading />
                                </IonCol>
                            </IonRow>
                        )}
                    </IonList>
                    <IonButton
                        size="small"
                        fill="outline"
                        onClick={this.submit}>
                        Submit
                    </IonButton>
                    <IonButton
                        size="small"
                        fill="outline"
                        routerLink={routes.ORG_LIST}>
                        Cancel
                    </IonButton>
                </form>
            </IonContent>
        );
    }
}

export default withRouter(NewOrg);
