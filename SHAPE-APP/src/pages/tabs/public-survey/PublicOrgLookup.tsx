import React, { Component } from 'react';

import { IonButton, IonContent, IonItem, IonLabel, IonPage, IonSelect, IonSelectOption } from '@ionic/react';
import Loading from '../../layout/Loading';
import AppHeader from '../../layout/AppHeader';
import { isEmptyObject } from '../../../utils/Utils';
import { routes } from '../../../utils/Constants';

interface SurveyOrgName {
    id: string;
    org: string;
    name: string;
}

interface PassedProps {
    toggleLoading: Function;
    loading: boolean;
    publicSurveys: Array<SurveyOrgName>;
    selectPublicSurvey: Function;
}

interface OrgLookupState {
    selectedPublicSurvey: { org: string; name: string } | null;
    error: boolean;
}

class PublicOrgLookup extends Component<PassedProps, OrgLookupState> {
    constructor(props: PassedProps) {
        super(props);
        this.state = {
            selectedPublicSurvey: null,
            error: false
        };
    }

    handleOrgChange(event: CustomEvent<any>) {
        //@ts-ignore
        if (event.target.value !== null) {
            //@ts-ignore
            const value = JSON.parse(event.target.value);
            this.setState({
                selectedPublicSurvey: value
            });
            this.props.selectPublicSurvey(value.id, value.org, value.name);
        }
    }

    resetState = () => {
        this.setState({
            selectedPublicSurvey: null
        });
    };

    render = () => {
        const { loading, publicSurveys } = this.props;
        const { selectedPublicSurvey } = this.state;
        const LoadingIndicator = loading ? <Loading /> : null;

        const org = selectedPublicSurvey ? selectedPublicSurvey.org : '';

        return (
            <IonPage>
                <AppHeader showHeader={true} text={'Select Public Survey'} />
                <IonContent className='ion-padding'>
                    <p className='small-text'>Please select the organization and survey you wish to join.</p>
                    {LoadingIndicator}
                    <IonItem>
                        <IonLabel style={{ textAlignVertical: 'top' }} position='stacked'>
                            Organization / Survey
                        </IonLabel>
                        <IonSelect
                            data-testid='org-select'
                            className='rounded-input'
                            name={`orgSelect`}
                            okText='Ok'
                            cancelText='Cancel'
                            onIonChange={(e) => this.handleOrgChange(e)}>
                            {publicSurveys.map((choice) => {
                                return (
                                    <IonSelectOption key={choice.name} value={JSON.stringify(choice)}>
                                        {`${choice.org} / ${choice.name}`}
                                    </IonSelectOption>
                                );
                            })}
                        </IonSelect>
                    </IonItem>
                    <IonButton
                        expand='block'
                        fill='solid'
                        id='participant-query'
                        onClick={() => this.resetState()}
                        routerLink={`${routes.TAB_TERMS_AND_CONDITIONS}/${org}/public`}
                        color='primary'
                        disabled={isEmptyObject(selectedPublicSurvey)}>
                        Next
                    </IonButton>
                </IonContent>
            </IonPage>
        );
    };
}

export default PublicOrgLookup;
