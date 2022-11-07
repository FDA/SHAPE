import React from 'react';
import { IonCheckbox, IonRow, IonCol } from '@ionic/react';
import { User } from '../../interfaces/DataTypes';

interface Props {
    parent: React.Component;
    setEmailChecked: Function;
    setSMSChecked: Function;
    setInAppChecked: Function;
    participantList: Array<User>;
    checkedEmailList: Array<User>;
    checkedSMSList: Array<User>;
    checkedInAppList: Array<User>;
    allEmailChecked: boolean;
    allSMSChecked: boolean;
    allInAppChecked: boolean;
    org: string;
}

class NotificationParticipantList extends React.Component<Props, {}> {
    render() {
        const {
            parent,
            setEmailChecked,
            setSMSChecked,
            setInAppChecked,
            participantList,
            checkedEmailList,
            checkedSMSList,
            checkedInAppList,
            org
        } = this.props;

        return participantList.map((elem: User, index: number) => {
            let participantIdFilter = elem.participantId.filter((e: any) => e.org === org);
            let participantId = participantIdFilter.length > 0 ? participantIdFilter[0].id : '';
            return (
                <IonRow
                    key={index}
                    style={{
                        width: '100%',
                        padding: '1px 16px 1px 16px'
                    }}>
                    <IonCol style={{ padding: '6px' }} size='1'>
                        <IonCheckbox
                            title='Email notification checkbox'
                            disabled={!elem.emailEnabled}
                            checked={
                                checkedEmailList.filter((p: User) => {
                                    return p.docId === elem.docId;
                                }).length > 0
                            }
                            onClick={() => {
                                setEmailChecked(
                                    parent,
                                    elem,
                                    checkedEmailList.indexOf(elem) <= -1,
                                    checkedEmailList
                                );
                            }}
                        />
                    </IonCol>
                    <IonCol size='1'>
                        <IonCheckbox
                            title='Sms notification checkbox'
                            disabled={!elem.smsEnabled}
                            checked={
                                checkedSMSList.filter((p: User) => {
                                    return p.docId === elem.docId;
                                }).length > 0
                            }
                            onClick={(e: any) =>
                                setSMSChecked(
                                    parent,
                                    elem,
                                    checkedSMSList.indexOf(elem) <= -1,
                                    checkedSMSList
                                )
                            }
                        />
                    </IonCol>
                    <IonCol size='1'>
                        <IonCheckbox
                            title='In app notification checkbox'
                            //In-app messaging is always enabled - push notifications are what can be disabled
                            checked={
                                checkedInAppList.filter((p: User) => {
                                    return p.docId === elem.docId;
                                }).length > 0
                            }
                            onClick={(e: any) =>
                                setInAppChecked(
                                    parent,
                                    elem,
                                    checkedInAppList.indexOf(elem) <= -1,
                                    checkedInAppList
                                )
                            }
                        />
                    </IonCol>
                    <IonCol size='2'>{participantId}</IonCol>
                    <IonCol size='1'>{elem.firstName}</IonCol>
                    <IonCol size='1'>{elem.lastName}</IonCol>
                    <IonCol size='2'>{elem.userName}</IonCol>
                    <IonCol size='2'>{elem.phoneNumber}</IonCol>
                    <IonCol size='1'>{elem.active ? 'Yes' : 'No'}</IonCol>
                </IonRow>
            );
        });
    }
}

export default NotificationParticipantList;
