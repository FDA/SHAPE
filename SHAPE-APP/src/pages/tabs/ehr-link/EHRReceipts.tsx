import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import {
  IonContent,
  IonPage,
  IonItem,
  IonText,
  IonLabel,
  IonList,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonFab,
  IonFabButton,
  IonIcon,
} from "@ionic/react";
import { addCircleOutline } from "ionicons/icons";
import { isEmptyObject } from "../../../utils/Utils";
import { compareDesc, format } from "date-fns";
import AppHeader from "../../layout/AppHeader";
import Loading from "../../layout/Loading";
import { routes, dateFormats } from "../../../utils/Constants";
import { FirebaseAuth, EHRReceipt } from "../../../interfaces/DataTypes";

interface ParentReceipt {
  ehrReceipts: Array<EHRReceipt>;
}

interface PassedProps {
  fireBaseAuth: FirebaseAuth;
  isLoading: boolean;
  receipt: ParentReceipt;
}

class EHRReceipts extends Component<PassedProps, {}> {
  getStyle = (read: boolean) => {
    if (read) return "light";
    else return "";
  };

  render() {
    let { fireBaseAuth, isLoading, receipt } = this.props;
    let { isEmpty } = fireBaseAuth;
    let { ehrReceipts } = receipt;

    if (isEmpty) return <Redirect to={routes.LOGIN} />;

    let sortedEHRReceipts = [...ehrReceipts].sort(
      (a: EHRReceipt, b: EHRReceipt) =>
        compareDesc(new Date(a.timestamp), new Date(b.timestamp)) ? 1 : -1
    );

    return (
      <IonPage>
        <AppHeader showHeader={!isEmpty} text={"EHR"} />
        <IonContent color="light">
          <IonList style={{ padding: 0 }}>
            {!isEmptyObject(ehrReceipts) &&
              sortedEHRReceipts.map((ehrReceipt: EHRReceipt, index: number) => {
                return (
                  <IonItem lines="full" key={index}>
                    <IonLabel position="fixed">
                      {format(
                        new Date(ehrReceipt.timestamp),
                        dateFormats.MMddyyyy
                      )}
                    </IonLabel>
                    <IonText>
                      {ehrReceipt.profile.name} - {ehrReceipt.ehr.name}
                    </IonText>
                  </IonItem>
                );
              })}
            {isEmptyObject(ehrReceipts) && (
              <IonCard style={{ textAlign: "center" }}>
                <IonCardHeader>
                  <IonCardTitle>No EHR Records Created</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>Check back later!</IonCardContent>
              </IonCard>
            )}
          </IonList>
          {isLoading && <Loading />}
          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton routerLink={routes.ADD_EHR}>
              <IonIcon icon={addCircleOutline} />
            </IonFabButton>
          </IonFab>
        </IonContent>
      </IonPage>
    );
  }
}

export default EHRReceipts;
