import {
    IonRow,
    IonCol,
    IonLabel,
    IonText,
    IonTextarea,
    IonItem,
    IonCardHeader,
    IonCardTitle
} from '@ionic/react';
import React, {Component} from 'react';

interface Props {
    editing: boolean;
    title: string;
    handleRowChange: Function;
    name: string;
}

class ReorderCard extends Component<Props> {
    render() {
        const {editing, title, handleRowChange, name} = this.props;
        return (
            <>
                <IonCardHeader>
                    <IonCardTitle>
                        <IonRow>
                            <IonCol size="12">
                                <IonItem>
                                    <IonLabel position="fixed">
                                        <IonText color="secondary">
                                            Question&nbsp;&nbsp;&nbsp;
                                        </IonText>
                                    </IonLabel>
                                    <IonTextarea
                                        color="dark"
                                        rows={1}
                                        autoGrow={false}
                                        readonly={!editing}
                                        value={title}
                                        name={'title'}
                                        onIonBlur={(e: any) =>
                                            handleRowChange(e, name)
                                        }
                                    />
                                </IonItem>
                            </IonCol>
                        </IonRow>
                    </IonCardTitle>
                </IonCardHeader>
            </>
        );
    }
}

export default ReorderCard;
