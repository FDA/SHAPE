import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import {
    IonContent,
    IonPage,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonCardTitle,
    IonFab,
    IonFabButton,
    IonIcon,
    IonCol,
    IonGrid,
    IonRow,
    IonButton
} from '@ionic/react';
import { addCircleOutline } from 'ionicons/icons';
import { isEmptyObject } from '../../../utils/Utils';
import { compareDesc } from 'date-fns';
import AppHeader from '../../layout/AppHeader';
import Loading from '../../layout/Loading';
import { routes } from '../../../utils/Constants';
import { FirebaseAuth, EHRReceipt, Survey } from '../../../interfaces/DataTypes';
import ItemList from '../../components/ItemList';

interface ParentReceipt {
    ehrReceipts: Array<EHRReceipt>;
}

interface PassedProps {
    fireBaseAuth: FirebaseAuth;
    isLoading: boolean;
    receipt: ParentReceipt;
    surveys: Array<Survey>;
}

class EHRReceipts extends Component<PassedProps, {}> {
    render() {
        const { fireBaseAuth, isLoading, receipt, surveys } = this.props;
        const { isEmpty } = fireBaseAuth;
        const { ehrReceipts } = receipt;

        if (isEmpty) return <Redirect to={routes.LOGIN} />;

        const sortedEHRReceipts = [...ehrReceipts].sort((a: EHRReceipt, b: EHRReceipt) =>
            compareDesc(new Date(a.timestamp), new Date(b.timestamp)) ? -1 : 1
        );

        return (
            <IonPage>
                <AppHeader showHeader={!isEmpty} text={'EHR'} />
                <IonContent>
                    {!isEmptyObject(ehrReceipts) && (
                        <>
                            <ItemList data={sortedEHRReceipts} />
                            <IonFab vertical='bottom' horizontal='end' slot='fixed'>
                                <IonFabButton routerLink={routes.ADD_EHR}>
                                    <IonIcon icon={addCircleOutline} aria-label={'add ehr icon'} />
                                </IonFabButton>
                            </IonFab>
                        </>
                    )}

                    {isEmptyObject(ehrReceipts) && !isEmptyObject(surveys) && (
                        // Using IonGrid to force consistent padding
                        <IonGrid>
                            <IonRow>
                                <IonCol>
                                    <EmptyEHRCard />
                                </IonCol>
                            </IonRow>
                        </IonGrid>
                    )}

                    {isEmptyObject(surveys) && (
                        // Using IonGrid to force consistent padding
                        <IonGrid>
                            <IonRow>
                                <IonCol>
                                    <NoSurveyCard />
                                </IonCol>
                            </IonRow>
                        </IonGrid>
                    )}

                    {isLoading && <Loading />}
                </IonContent>
            </IonPage>
        );
    }
}

const EmptyEHRCard = () => {
    return (
        <IonCard style={{ textAlign: 'center' }}>
            <IonCardHeader>
                <IonCardTitle>
                    You have not yet elected to share your Electronic Health Records (EHRs)
                </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
                <p className='ion-padding-bottom'>
                    EHRs contain all the health information your provider has recorded for you and can provide
                    a wealth of information for your organization’s study.
                </p>
                <p className='ion-padding-bottom'>
                    To voluntarily start the process of sharing your information, click the button below.
                </p>
                <p className='ion-padding-bottom'>
                    Note that you will have multiple opportunities to opt out of sharing before submitting.
                </p>
                <p className='ion-padding-bottom'>
                    <strong>This grants a non-recurring, one-time access to your EHR.</strong>
                </p>
                <IonButton className='ion-margin-top' routerLink={routes.ADD_EHR}>
                    Add EHR
                </IonButton>
            </IonCardContent>
        </IonCard>
    );
};

const NoSurveyCard = () => {
    return (
        <IonCard style={{ textAlign: 'center' }}>
            <IonCardHeader>
                <IonCardTitle>You have not yet joined a Survey</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
                <p className='ion-padding-bottom'>
                    In order to share your EHRs, you must first join a survey.
                </p>
                <IonButton className='ion-margin-top' routerLink={routes.TAB_PUBLIC_PRIVATE_QUERY}>
                    Join a Survey
                </IonButton>
            </IonCardContent>
        </IonCard>
    );
};
export default EHRReceipts;
