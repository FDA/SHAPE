import {
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonGrid,
    IonCol,
    IonRow,
    IonCard,
    IonCardContent,
    IonItem
} from '@ionic/react';
import React from 'react';
import {isEmptyObject} from '../utils/Utils';
import {withRouter, RouteComponentProps} from 'react-router-dom';
import {getAllEHRReceipts, getEHR} from '../utils/API';
import {compareDesc, format} from 'date-fns';
import Loading from '../layout/Loading';
import {EHRReceipt} from '../interfaces/DataTypes';
import {routes, dateFormats} from '../utils/Constants';

interface EhrEHRReceipt extends EHRReceipt {
    participantId: string;
}

interface State {
    ehr: Array<EhrEHRReceipt>;
    isLoading: boolean;
}

class EHRReceipts extends React.Component<RouteComponentProps, State> {
    constructor(props: RouteComponentProps) {
        super(props);
        this.state = {
            ehr: [],
            isLoading: false
        };
    }

    downloadURI(uri: string, name: string) {
        var a = document.createElement('a');
        a.href = uri;
        a.setAttribute('download', name);
        a.click();
        a.remove();
    }

    downloadEHR(path: string) {
        getEHR(path)
            .then((res: any) => {
                this.downloadURI(res, path);
            })
            .catch((err: any) => {
                console.error(err);
            });
    }

    UNSAFE_componentWillMount() {
        this.setState({isLoading: true});
        let parent = this;
        let ehr: Array<EhrEHRReceipt> = [];
        getAllEHRReceipts()
            .then(function (snapshot: any) {
                snapshot.forEach(function (doc: any) {
                    let participant = doc.data;
                    let participantId = participant.participantId;
                    let {receipts} = participant;
                    receipts.forEach(function (elem: EhrEHRReceipt) {
                        elem.participantId = participantId;
                        ehr.push(elem);
                    });
                });
                parent.setState({ehr: ehr, isLoading: false});
            })
            .catch((err: any) => {
                console.error(err);
            });
    }

    render() {
        let {ehr, isLoading} = this.state;

        ehr.sort((a: EhrEHRReceipt, b: EhrEHRReceipt) =>
            compareDesc(new Date(a.timestamp), new Date(b.timestamp))
        );

        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonBackButton defaultHref={routes.HOME} />
                        </IonButtons>
                        <IonTitle>EHR Receipts</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <IonGrid>
                        <IonItem color="light">
                            <IonCol size="2">Timestamp</IonCol>
                            <IonCol size="2">Respondent ID</IonCol>
                            <IonCol size="2">Participant Name</IonCol>
                            <IonCol size="2">EHR Name</IonCol>
                            <IonCol size="4">Path</IonCol>
                        </IonItem>
                        {isLoading && (
                            <IonRow text-center>
                                <IonCol size="12" style={{textAlign: 'center'}}>
                                    <Loading />
                                </IonCol>
                            </IonRow>
                        )}
                        {ehr.map((receipt: EhrEHRReceipt, index: number) => {
                            return (
                                <IonItem
                                    onClick={() =>
                                        this.downloadEHR(receipt.path)
                                    }
                                    key={index}
                                    style={{
                                        cursor: 'pointer',
                                        border: '1px solid lightgrey'
                                    }}>
                                    <IonCol size="2">
                                        {format(
                                            new Date(receipt.timestamp),
                                            dateFormats.MMddyyZYYHHmmss
                                        )}
                                    </IonCol>
                                    <IonCol size="2">
                                        {receipt.participantId}
                                    </IonCol>
                                    <IonCol size="2">
                                        {receipt.profile.name}
                                    </IonCol>
                                    <IonCol size="2">{receipt.ehr.name}</IonCol>
                                    <IonCol size="4">{receipt.path}</IonCol>
                                </IonItem>
                            );
                        })}
                    </IonGrid>
                    {!isLoading && isEmptyObject(ehr) && (
                        <IonCard style={{textAlign: 'center'}}>
                            <IonCardContent>
                                No EHRs have been created.
                            </IonCardContent>
                        </IonCard>
                    )}
                </IonContent>
            </IonPage>
        );
    }
}
export default withRouter(EHRReceipts);
