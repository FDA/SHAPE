import React from 'react';
import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonLabel,
    IonText
} from '@ionic/react';
import {
    getQuestionnaireResponseJSONExport,
    getQuestionnaireResponseFHIRExport
} from '../../utils/API';
import {Q13} from '../../interfaces/DataTypes';
import {format} from 'date-fns';
import {isEmptyObject} from '../../utils/Utils';
import {dateFormats} from '../../utils/Constants';

export const Q13Card: React.FC<Q13> = (q13) => {
    const {questionnaire} = q13;

    const processDownload = (response: any) => {
        const fileName = `${q13.id}_responses`;
        const json = JSON.stringify(response, null, 2);
        const blob = new Blob([json], {type: 'application/json'});
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = fileName + '.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadFile = async () => {
        getQuestionnaireResponseFHIRExport(questionnaire.id).then(
            async (response: any) => {
                processDownload(response);
            }
        );
    };

    const downloadJSONFile = async () => {
        getQuestionnaireResponseJSONExport(questionnaire.id).then(
            async (response: any) => {
                processDownload(response);
            }
        );
    };

    const getTextColor = (open: boolean, locked: boolean) => {
        if (open) return 'success';
        else if (locked) return 'secondary';
        else return 'tertiary';
    };

    const getOpenText = (open: boolean, locked: boolean) => {
        if (open) return 'Open';
        else if (locked) return 'Closed';
        else return 'Draft';
    };

    return (
        <IonCard
            button={true}
            disabled={q13.surveyLocked}
            routerLink={q13.href}
            onClick={() => {
                q13.storeQuestionnaire(questionnaire.id);
            }}>
            <IonCardHeader>
                <IonCardTitle>{q13.questionnaire.name}</IonCardTitle>
                <IonCardSubtitle>
                    {q13.questionnaire.shortDescription}
                </IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent style={{padding: '16px'}}>
                <IonLabel color="tertiary">Status:</IonLabel>{' '}
                <IonText
                    color={getTextColor(
                        questionnaire.open,
                        questionnaire.locked
                    )}>
                    {getOpenText(questionnaire.open, questionnaire.locked)}
                </IonText>
                <br />
                <IonLabel color="tertiary">Date Created:</IonLabel>
                <IonText>
                    {!isEmptyObject(q13.questionnaire.dateCreated)
                        ? format(
                              new Date(q13.questionnaire.dateCreated),
                              dateFormats.MMddyyZYYHHmmss
                          )
                        : 'N/A'}
                </IonText>
                <br />
                <br />
                <IonButton
                    fill="outline"
                    expand="block"
                    color="primary"
                    onClick={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        downloadJSONFile();
                    }}>
                    Download Responses (JSON)
                </IonButton>
                <IonButton
                    fill="outline"
                    expand="block"
                    color="secondary"
                    onClick={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        downloadFile();
                    }}>
                    Download Responses (FHIR)
                </IonButton>
                <IonButton
                    fill="outline"
                    expand="block"
                    color="tertiary"
                    disabled={q13.surveyLocked}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        q13.duplicate(q13.questionnaire);
                    }}>
                    Duplicate
                </IonButton>
            </IonCardContent>
        </IonCard>
    );
};
