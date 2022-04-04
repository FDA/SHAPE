import React from 'react';
import {IonCheckbox, IonRow, IonCol} from '@ionic/react';
import {User} from '../../interfaces/DataTypes';

interface Props {
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
}

class NotificationParticipantList extends React.Component<Props, {}> {
    render() {
        const {
            setEmailChecked,
            setSMSChecked,
            setInAppChecked,
            participantList,
            checkedEmailList,
            checkedSMSList,
            checkedInAppList
        } = this.props;

        return participantList.map((elem: User) => {
            return (
                <IonRow
                    key={elem.docId}
                    style={{
                        width: '100%',
                        padding: '1px 16px 1px 16px'
                    }}>
                    <IonCol style={{padding: '6px'}} size="1">
                        <IonCheckbox
                            disabled={!elem.emailEnabled}
                            checked={
                                checkedEmailList.filter((p: User) => {
                                    return p.docId === elem.docId;
                                }).length > 0
                            }
                            onClick={() => {
                                setEmailChecked(
                                    elem,
                                    checkedEmailList.indexOf(elem) <= -1
                                );
                            }}
                        />
                    </IonCol>
                    <IonCol size="1">
                        <IonCheckbox
                            disabled={!elem.smsEnabled}
                            checked={
                                checkedSMSList.filter((p: User) => {
                                    return p.docId === elem.docId;
                                }).length > 0
                            }
                            onClick={(e: any) =>
                                setSMSChecked(
                                    elem,
                                    checkedSMSList.indexOf(elem) <= -1
                                )
                            }
                        />
                    </IonCol>
                    <IonCol size="1">
                        <IonCheckbox
                            //In-app messaging is always enabled - push notifications are what can be disabled
                            checked={
                                checkedInAppList.filter((p: User) => {
                                    return p.docId === elem.docId;
                                }).length > 0
                            }
                            onClick={(e: any) =>
                                setInAppChecked(
                                    elem,
                                    checkedInAppList.indexOf(elem) <= -1
                                )
                            }
                        />
                    </IonCol>
                    <IonCol size="2">{elem.participantId}</IonCol>
                    <IonCol size="1">{elem.firstName}</IonCol>
                    <IonCol size="1">{elem.lastName}</IonCol>
                    <IonCol size="2">{elem.userName}</IonCol>
                    <IonCol size="2">{elem.phoneNumber}</IonCol>
                    <IonCol size="1">{elem.active ? 'Yes' : 'No'}</IonCol>
                </IonRow>
            );
        });
    }
}

export default NotificationParticipantList;
