import React from 'react';
import {IonButton} from '@ionic/react';

interface Props {
    editing: boolean;
    edit: Function;
    save: Function;
    cancel: Function;
    locked: boolean;
}

class EditSaveCancelButton extends React.Component<Props> {
    render() {
        const {editing, edit, save, cancel, locked} = this.props;

        if (!editing)
            return (
                <IonButton
                    color="success"
                    fill="clear"
                    disabled={locked}
                    onClick={() => edit()}>
                    Edit
                </IonButton>
            );
        else
            return (
                <>
                    <IonButton
                        color="success"
                        fill="clear"
                        onClick={() => save()}>
                        Save
                    </IonButton>
                    <IonButton color="medium" onClick={() => cancel()}>
                        Cancel
                    </IonButton>
                </>
            );
    }
}

export default EditSaveCancelButton;
