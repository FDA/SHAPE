import React from "react";
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton } from "@ionic/react";
import { routes } from "../../../utils/Constants";

export const JoinSurveyCard: React.FC<any> = () => (
    <div style={{ textAlign: "center" }}>
    <IonCard>
        <IonCardHeader>
            <IonCardTitle justify-content-center align-items-center>No Surveys Available</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
            You are currently not part of any surveys.
            Click the button below to join an organization.
            If you have already joined an organization, your organization(s) do not have any active surveys at this time.
            <br/><br/>
        <IonButton
            routerLink={routes.TAB_PUBLIC_PRIVATE_QUERY}
        >
            Join a Survey
        </IonButton>
        </IonCardContent>
    </IonCard>
    </div>
);
