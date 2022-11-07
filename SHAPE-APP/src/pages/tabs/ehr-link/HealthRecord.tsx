import React, { Component } from 'react';
import {
    IonButton,
    IonContent,
    IonFooter,
    IonItem,
    IonLabel,
    IonModal,
    IonPage,
    IonHeader
} from '@ionic/react';
import EhrViewer from './EHRViewer';

interface PassedProps {
    data: any;
}

interface HealthRecordState {
    showModal: boolean;
    selectedResource: any;
}

class HealthRecord extends Component<PassedProps, HealthRecordState> {
    constructor(props: PassedProps) {
        super(props);
        this.state = { showModal: false, selectedResource: null };
    }

    handleClick = (selectedResource: any) => {
        this.setState({
            showModal: true,
            selectedResource: selectedResource
        });
    };
    closeModal = () => {
        this.setState({ showModal: false });
    };

    render() {
        const { data } = this.props;
        if (!data) {
            return null;
        }
        const { entry, error } = data;
        const { showModal, selectedResource } = this.state;
        let dataView;
        if (error) {
            dataView = <p>An error has occured, please restart this process from the beginning.</p>;
        } else {
            dataView = entry.map((row: any) => {
                const { resource } = row;
                return (
                    <IonItem
                        button
                        key={resource.id}
                        detail={true}
                        onClick={() => this.handleClick(resource)}>
                        <IonLabel>
                            <h2>{resource.resourceType}</h2>
                            <h3>{resource.status}</h3>
                        </IonLabel>
                    </IonItem>
                );
            });
        }
        return (
            <>
                {dataView}
                <IonModal isOpen={showModal} backdropDismiss={true} onDidDismiss={() => this.closeModal()}>
                    <IonPage>
                        <IonHeader />
                        <IonContent className='ion-padding'>
                            <EhrViewer data={selectedResource} />
                        </IonContent>
                        <IonFooter className='ion-no-border'>
                            <IonButton onClick={() => this.closeModal()}>Close</IonButton>
                        </IonFooter>
                    </IonPage>
                </IonModal>
            </>
        );
    }
}

export default HealthRecord;
