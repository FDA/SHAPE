import React, { Component } from 'react';
import { IonIcon, IonItem, IonLabel, IonList, IonText } from '@ionic/react';
import { personSharp } from 'ionicons/icons';
import { routes } from '../../../utils/Constants';
import { isEmptyObject } from '../../../utils/Utils';

interface PassedProps {
    data: any;
}
class PatientView extends Component<PassedProps, {}> {
    onClick = (e: any, resource: any) => {
        alert(JSON.stringify(resource));
    };

    render() {
        const { data } = this.props;
        let displayData = null;
        if (isEmptyObject(data)) {
            displayData = (
                <IonItem routerLink={routes.TAB1}>
                    An error has occurred. Please contact the system administrator.
                </IonItem>
            );
        } else {
            const { entry } = data;
            if (isEmptyObject(entry)) {
                displayData = (
                    <IonItem routerLink={routes.TAB1}>
                        <IonText color='danger'>
                            Please ensure that you have granted access to Patient records on your provider
                            portal and try again.
                        </IonText>
                    </IonItem>
                );
            } else {
                displayData = entry.map((row: any) => {
                    const { resource } = row;
                    const { name } = resource;
                    if (resource && resource.birthDate) {
                        return (
                            <IonItem
                                key={resource.id}
                                detail={true}
                                routerLink={`${routes.STORE_EHR}/${resource.id}`}>
                                <IonLabel>
                                    <IonIcon
                                        icon={personSharp}
                                        size='large'
                                        slot='start'
                                        aria-label={'profile icon'}
                                    />
                                    <h1>{`${name[0].given} ${name[0].family}`}</h1>
                                    <div>Gender: {resource.gender}</div>
                                    <div>DOB:{resource.birthDate}</div>
                                </IonLabel>
                            </IonItem>
                        );
                    } else return null;
                });
            }
        }

        return <IonList>{displayData}</IonList>;
    }
}

export default PatientView;
