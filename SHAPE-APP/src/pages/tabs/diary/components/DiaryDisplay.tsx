import React from 'react';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonItem,
    IonModal,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import {
    optionsArr, //healthEvent
    outcomeChoices, //outcome
    treatmentChoices, //eventTreatment, postEventTreatment
    assessmentArr, //assessers
    GMFCArr, //GMFCType
    treatmentVals, //prescription
    deviceVals, //device
    ongoingArr, //ongoingStatus
    doctorVisit,
    withdrawal,
    he,
    clinicalEncounterHealthEventArr
} from '../event-forms/DiaryMappings';
import { format } from 'date-fns';
import { dateFormats } from '../../../../utils/Constants';
import { isEmptyObject } from '../../../../utils/Utils';

interface PassedProps {
    displayedData: string;
    displayedItem: string;
    router: HTMLElement;
    modalOpen: boolean;
    closeModal: Function;
}

const getClinicalVisitLabel = (data: any, key: string) => {
    let value = data[key];
    if (key === 'assessers' && typeof value === 'object') {
        for (let i = 0; i < value.length; i++) {
            const val = value[i];
            const valLookup = assessmentArr.find((item) => item.val === val) || {
                text: ''
            };
            value[i] = valLookup.text;
        }
    }
    if (key === 'assessers' && typeof value === 'number') {
        const valLookup = assessmentArr.find((item) => item.val === value) || {
            text: ''
        };
        value = valLookup.text;
    }
    if (key === 'prescription') {
        const valLookup = treatmentVals.find((item) => item.val === value) || {
            text: ''
        };
        value = valLookup.text;
    }
    if (key === 'device') {
        for (let i = 0; i < value.length; i++) {
            const val = value[i];
            const valLookup = deviceVals.find((item) => item.val === val) || {
                text: ''
            };
            value[i] = valLookup.text;
        }
    }
    if (key === 'healthEvent') {
        const valLookup = clinicalEncounterHealthEventArr.find((item) => item.val === value) || {
            text: ''
        };
        value = valLookup.text;
    }
    if (key === 'ongoingStatus') {
        const valLookup = ongoingArr.find((item) => item.val === value) || {
            text: ''
        };
        value = valLookup.text;
    }
    if (key === 'outcome') {
        const valLookup = outcomeChoices.find((item) => item.val === value) || {
            text: ''
        };
        value = valLookup.text;
    }
    if (key === 'GMFCType') {
        const valLookup = GMFCArr.find((item) => item.val === value) || {
            text: ''
        };
        value = valLookup.text;
    }

    return value;
};

const getHealthEventLabel = (data: any, key: string) => {
    let value = data[key];
    if (key === 'healthEvent') {
        const valLookup = optionsArr.find((item) => item.val === value) || {
            text: ''
        };
        value = valLookup.text;
    }
    if (key === 'outcome') {
        const valLookup = outcomeChoices.find((item) => item.val === value) || {
            text: ''
        };
        value = valLookup.text;
    }
    if (key === 'eventTreatment' || key === 'postEventTreatment') {
        const valLookup = treatmentChoices.find((item) => item.val === value) || {
            text: ''
        };
        value = valLookup.text;
    }

    if (key === 'ongoingStatus') {
        const valLookup = ongoingArr.find((item) => item.val === value) || {
            text: ''
        };
        value = valLookup.text;
    }

    return value;
};

const formatDates = ['dateWritten', 'withdrawalDate'];

const getDisplayValue = (key: string, labelValue: string, keyValue: string) => {
    if (formatDates.includes(key)) {
        if (key === 'dateWritten') {
            return `${labelValue}: ${
                keyValue ? format(new Date(keyValue), dateFormats.MMddyyyy + ' HH:mm:ss') : ''
            }`;
        }
        return `${labelValue}: ${keyValue ? format(new Date(keyValue), dateFormats.MMddyyyy) : ''}`;
    } else {
        return `${labelValue}: ${!isEmptyObject(keyValue) ? keyValue : 'N/A'}`;
    }
};

const getDisplayData = (data: any, formType: string) => {
    if (formType === 'Clinical Visit') {
        return doctorVisit.map(({ label: key, value: labelValue }) => {
            const keyValue = getClinicalVisitLabel(data, key);
            return getDisplayValue(key, labelValue, keyValue);
        });
    } else if (formType === 'Health Event') {
        return he.map(({ label: key, value: labelValue }) => {
            const keyValue = getHealthEventLabel(data, key);
            return getDisplayValue(key, labelValue, keyValue);
        });
    } else if (formType === 'Withdrawal') {
        return withdrawal.map(({ label: key, value: labelValue }) => {
            const keyValue = data[key];
            return getDisplayValue(key, labelValue, keyValue);
        });
    } else return [];
};

export const DiaryDisplay = (props: PassedProps) => {
    const { displayedData, displayedItem, router, modalOpen, closeModal } = props;
    let data: any = {};
    let formType = '';
    let displayTitle = displayedItem;

    if (displayedItem === 'Clinical Visit') displayTitle = 'Clinical Encounter';
    if (displayedItem === 'Withdrawal') displayTitle = 'Study Withdrawal';

    if (displayedData) {
        data = JSON.parse(displayedData);
        delete data['participantId'];
        delete data['surveyId'];
        delete data['org'];
        formType = data.formType;
        delete data['formType'];
    }

    const displayData = getDisplayData(data, formType);

    return (
        <IonModal
            isOpen={modalOpen}
            presentingElement={router || undefined}
            onDidDismiss={() => closeModal()}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>
                        <strong>{displayTitle + ' Details'}</strong>
                    </IonTitle>
                    <IonButtons slot='start'>
                        <IonButton color='primary' type='button' onClick={() => closeModal()}>
                            Cancel
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className='ion-padding'>
                <div tabIndex={1}>
                    {!isEmptyObject(displayData) &&
                        displayData.map((elem: any, index: number) => {
                            return (
                                <IonItem lines='none' key={index}>
                                    {elem}
                                </IonItem>
                            );
                        })}
                </div>
            </IonContent>
        </IonModal>
    );
};
