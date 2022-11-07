import React from 'react';
import { IonButton } from '@ionic/react';

interface Props {
    editing: boolean;
    edit: Function;
    save: Function;
    cancel: Function;
    locked: boolean;
}

class EditSaveCancelButton extends React.Component<Props> {
    render() {
        const { editing, edit, save, cancel, locked } = this.props;

        if (!editing)
            return (
                <IonButton color='success' fill='clear' disabled={locked} onClick={() => edit()}>
                    <b>Edit</b>
                </IonButton>
            );
        else
            return (
                <>
                    <IonButton color='success' fill='clear' onClick={() => save()}>
                        <b>Save</b>
                    </IonButton>
                    <IonButton color='medium' onClick={() => cancel()}>
                        <b>Cancel</b>
                    </IonButton>
                </>
            );
    }
}

export default EditSaveCancelButton;
