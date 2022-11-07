import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import {
    IonFab,
    IonFabButton,
    IonIcon,
    IonContent,
    IonPage,
    IonToolbar,
    IonHeader,
    IonTitle,
    IonGrid,
    IonRow,
    IonCol
} from '@ionic/react';

import { addCircleOutline } from 'ionicons/icons';
import { isEmptyObject } from '../../../utils/Utils';
import './Diary.css';
import { DiaryDisplay, EmptyDiaryCard } from './components';
import { FirebaseAuth, DiaryResponse } from '../../../interfaces/DataTypes';
import { routes } from '../../../utils/Constants';
import ItemList from '../../components/ItemList';

interface DiaryProps {
    setDisplay: Function;
    userDiaryEntries: Array<DiaryResponse>;
    fireBaseAuth: FirebaseAuth;
}

interface DiaryState {
    displayedItem: string;
    displayedData: string;
    modalOpen: boolean;
}

class Diary extends Component<DiaryProps, DiaryState> {
    routerRef: any;

    constructor(props: DiaryProps) {
        super(props);
        this.state = {
            displayedItem: '',
            displayedData: '',
            modalOpen: false
        };
    }

    setDisplayedItem = (displayedItem: string) => {
        this.setState({
            displayedItem
        });
    };

    setDisplayedData = (displayedData: string) => {
        this.setState({
            displayedData: displayedData,
            modalOpen: true
        });
    };

    closeModal = () => {
        this.setState({ displayedItem: '', displayedData: '', modalOpen: false });
    };

    setRouterRef = (element: any) => {
        this.routerRef = element;
    };

    diaryEntryClickEvent = (entry: DiaryResponse) => {
        const title = entry.formType;
        this.setDisplayedItem(title);
        this.setDisplayedData(JSON.stringify(entry, null, 2));
    };

    render() {
        const { displayedItem, displayedData, modalOpen } = this.state;
        const { userDiaryEntries, fireBaseAuth } = this.props;
        userDiaryEntries.sort((a: DiaryResponse, b: DiaryResponse) =>
            a.dateWritten < b.dateWritten ? 1 : -1
        );

        if (fireBaseAuth.isEmpty) {
            return <Redirect to={routes.LOGIN} />;
        }

        return (
            <IonPage className='diary-page' ref={this.setRouterRef}>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Self-Report</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    {!isEmptyObject(userDiaryEntries) ? (
                        <>
                            <ItemList data={userDiaryEntries} clickEvent={this.diaryEntryClickEvent} />
                            <IonFab vertical='bottom' horizontal='end' slot='fixed'>
                                <IonFabButton routerLink={routes.NEW_DIARY_ENTRY}>
                                    <IonIcon icon={addCircleOutline} aria-label={'new diary entry icon'} />
                                </IonFabButton>
                            </IonFab>
                        </>
                    ) : (
                        <IonGrid>
                            <IonRow>
                                <IonCol>
                                    <EmptyDiaryCard />
                                </IonCol>
                            </IonRow>
                        </IonGrid>
                    )}
                    <DiaryDisplay
                        displayedItem={displayedItem}
                        displayedData={displayedData}
                        closeModal={this.closeModal}
                        modalOpen={modalOpen}
                        router={this.routerRef}
                    />
                </IonContent>
            </IonPage>
        );
    }
}

export default Diary;
