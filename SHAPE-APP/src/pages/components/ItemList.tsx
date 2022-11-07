import React, { Component } from 'react';
import { IonCol, IonGrid, IonItem, IonLabel, IonList, IonRow, IonText } from '@ionic/react';
import format from 'date-fns/format';
import { dateFormats } from '../../utils/Constants';
import { EHR, Person } from '../../interfaces/DataTypes';

interface ItemListProps {
    clickEvent?: Function;
    data: any[];
    showUnread?: boolean;
}
class ItemList extends Component<ItemListProps> {
    getTitle = (subject: string, ehr: EHR, title: string) => {
        if (subject) return subject;
        if (ehr) return ehr.name;
        if (title) {
            if (title === 'Clinical Visit') return 'Clinical Encounter';
            if (title === 'Withdrawal') return 'Study Withdrawal';
            return title;
        }
    };

    getDate = (timestamp: string, dateWritten: string) => {
        if (timestamp) return format(new Date(timestamp), dateFormats.MMddyyyy);
        return format(new Date(dateWritten), dateFormats.MMddyyyy);
    };

    getOwner = (org: string, profile: Person) => {
        if (org) return org;
        if (profile) return profile.name;
    };

    displayDetail = (clickEvent: any) => {
        if (!clickEvent) {
            return false;
        }
        return true;
    };

    isRead = (showUnread: any, read: boolean) => {
        if (showUnread) {
            return read;
        }
        return true;
    };

    render() {
        const { data, clickEvent, showUnread } = this.props;
        return (
            <IonList className='events'>
                {data.map((entry, index) => {
                    const {
                        formType: title,
                        dateWritten,
                        org,
                        subject,
                        timestamp,
                        ehr,
                        profile,
                        read
                    } = entry;

                    return (
                        <IonItem
                            button
                            key={`${title} ${dateWritten} ${index}`}
                            lines='full'
                            color={!this.isRead(showUnread, read) ? 'light' : ''}
                            onClick={() => {
                                if (clickEvent) {
                                    clickEvent(entry);
                                }
                            }}
                            detail={this.displayDetail(clickEvent)}>
                            <IonGrid
                                className='ion-no-padding'
                                style={{ width: '100%', paddingRight: '5px' }}>
                                <IonRow>
                                    <IonCol className='ion-no-padding' style={{ paddingBlock: '2px' }}>
                                        <IonLabel>{this.getTitle(subject, ehr, title)}</IonLabel>
                                    </IonCol>
                                </IonRow>
                                <IonRow>
                                    <IonCol size='auto' className='ion-no-padding'>
                                        <IonText color='primary'>
                                            <span>{this.getOwner(org, profile)}</span>
                                        </IonText>
                                    </IonCol>
                                    <IonCol></IonCol>
                                    <IonCol size='auto' className='ion-no-padding'>
                                        <IonText color='primary'>
                                            <span>{this.getDate(timestamp, dateWritten)}</span>
                                        </IonText>
                                    </IonCol>
                                </IonRow>
                            </IonGrid>
                        </IonItem>
                    );
                })}
            </IonList>
        );
    }
}

export default ItemList;
