import {IonButtons, IonButton} from '@ionic/react';
import React, {Component} from 'react';
import {EditSaveCancelButtonProps} from '../../interfaces/Components';

class EditSaveCancelButton extends Component<EditSaveCancelButtonProps> {
    render() {
        const {editing, edit, save, cancel, archive, locked} = this.props;
        if (locked) {
            return <></>;
        }

        if (!editing) {
            return (
                <IonButtons style={{float: 'right'}}>
                    <IonButton
                        color="primary"
                        size="small"
                        onClick={() => edit()}>
                        Edit
                    </IonButton>
                </IonButtons>
            );
        } else {
            return (
                <IonButtons style={{float: 'right'}}>
                    <IonButton color="primary" onClick={() => save()}>
                        Save
                    </IonButton>
                    <IonButton color="danger" onClick={() => archive()}>
                        Delete
                    </IonButton>
                    <IonButton color="medium" onClick={() => cancel()}>
                        Cancel
                    </IonButton>
                </IonButtons>
            );
        }
    }
}

export default EditSaveCancelButton;
