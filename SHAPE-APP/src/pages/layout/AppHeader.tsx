import React, { ReactNode } from 'react';
import { IonBackButton, IonButtons, IonHeader, IonTitle, IonToolbar, IonButton } from '@ionic/react';
import { RouteComponentProps, withRouter } from 'react-router';
import { routes } from '../../utils/Constants';

interface AppHeaderProps extends RouteComponentProps {
    showHeader?: boolean | null;
    noBorder?: boolean;
    text?: string | null;
    children?: ReactNode;
}

const AppHeader = (props: AppHeaderProps) => {
    const { showHeader, text, noBorder } = props;
    const headerText = text ? text : 'SHAPE';
    const { pathname } = props.history.location;

    const backButton = !(
        pathname === routes.TAB1 ||
        pathname === routes.TAB2 ||
        pathname === routes.TAB3
    ) && <IonBackButton defaultHref='tabs/tab1' />;

    const joinSurveyButton = pathname === routes.TAB1 && (
        <IonButton routerLink={routes.TAB_PUBLIC_PRIVATE_QUERY}>Join a Survey</IonButton>
    );

    const getClass = () => {
        return noBorder ? 'ion-no-border' : '';
    };

    return showHeader ? (
        <IonHeader class={getClass()}>
            <IonToolbar>
                <IonButtons slot='start'>{backButton}</IonButtons>
                <IonTitle>{headerText}</IonTitle>
                <IonButtons slot='end'>{joinSurveyButton}</IonButtons>
            </IonToolbar>
        </IonHeader>
    ) : (
        <div />
    );
};

export default withRouter(AppHeader);
