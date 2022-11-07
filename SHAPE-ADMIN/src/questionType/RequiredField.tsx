import React, { Component } from 'react';
import { IonCheckbox, IonInput, IonItem, IonLabel } from '@ionic/react';

interface Props {
    checked: boolean;
    changeEventHandler: Function;
    messageEventHandler: Function;
    message: string;
}

class RequiredField extends Component<Props, {}> {
    render() {
        return (
            <>
                <IonItem>
                    <IonLabel position='stacked'>Required</IonLabel>
                    <IonCheckbox
                        checked={this.props.checked}
                        onIonChange={(e) => this.props.changeEventHandler(e)}
                    />
                </IonItem>
                <IonItem>
                    <IonLabel position='stacked'>Required Question Instructions</IonLabel>
                    <IonInput
                        name={'requiredMessage'}
                        placeholder={'"A value is required for this question."'}
                        onIonChange={(e) => this.props.messageEventHandler(e)}
                        value={this.props.message}
                        onIonInput={(e) => this.props.messageEventHandler(e)}></IonInput>
                </IonItem>
            </>
        );
    }
}

export default RequiredField;
