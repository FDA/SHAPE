import React from 'react';
import {IonHeader, IonToolbar, IonRow, IonCol} from '@ionic/react';
import LoginLogout from '../authentication/LoginLogout';
import {withRouter, RouteComponentProps} from 'react-router-dom';
import {routes, images} from '../utils/Constants';

const AppHeader: React.FC<RouteComponentProps> = (props) => {
    return (
        <IonHeader>
            <IonToolbar>
                <IonRow>
                    <IonCol size="6">
                        <img
                            alt="shape-logo"
                            src={images.SHAPE_LOGO_HORIZONTAL}
                            height="64px"
                            style={{cursor: 'pointer'}}
                            onClick={() =>
                                props.history.push({pathname: `${routes.HOME}`})
                            }
                        />
                    </IonCol>
                    <IonCol size="6" style={{textAlign: 'right'}}>
                        <LoginLogout />
                    </IonCol>
                </IonRow>
            </IonToolbar>
        </IonHeader>
    );
};

export default withRouter(AppHeader);
