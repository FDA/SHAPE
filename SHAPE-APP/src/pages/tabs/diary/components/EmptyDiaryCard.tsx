import React from "react";
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton } from "@ionic/react";
import { routes } from "../../../../utils/Constants";

export const EmptyDiaryCard: React.FC<any> = () => (
    <div style={{ textAlign: "center" }}>
        <IonCard>
            <IonCardHeader>
                <IonCardTitle justify-content-center align-items-center>You have not yet submitted a self-report</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
                <p  className="ion-padding-bottom">Self-reports are opportunities for you to share ad-hoc information about your health to your organization.</p>
                <p  className="ion-padding-bottom">To create one, click the button below.</p>
                <IonButton
                    className="ion-margin-top"
                    routerLink={routes.NEW_DIARY_ENTRY}
                >
                    Add Self-Report Entry
                </IonButton>
            </IonCardContent>
        </IonCard>
    </div>
);
