import React, { ReactNode } from "react";
import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { RouteComponentProps, withRouter } from "react-router";
import { routes } from "../../utils/Constants";

interface AppHeaderProps extends RouteComponentProps {
  showHeader?: boolean | null;
  text?: string | null;
  children?: ReactNode;
}

const AppHeader = (props: AppHeaderProps) => {
  const { showHeader, text } = props;
  const headerText = text ? text : "SHAPE";
  const backButton =
    props.history.location.pathname === routes.TAB1 ? null : <IonBackButton />;
  return showHeader ? (
    <IonHeader>
      <IonToolbar className="ion-no-border">
        <IonButtons slot="start">{backButton}</IonButtons>
        <IonTitle>{headerText}</IonTitle>
      </IonToolbar>
    </IonHeader>
  ) : null;
};

export default withRouter(AppHeader);
