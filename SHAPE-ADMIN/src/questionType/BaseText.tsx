import {IonInput, IonItem, IonLabel, IonList} from '@ionic/react';
import React from 'react';

interface Props {
    handlePlaceholderChange: Function;
    placeholder: string;
}

class BaseText extends React.Component<Props> {
    render() {
        let {handlePlaceholderChange, placeholder} = this.props;

        return (
            <IonList lines="full" class="ion-no-margin ion-no-padding">
                <IonItem>
                    <IonLabel position="stacked">Placeholder</IonLabel>
                    <IonInput
                        placeholder="Placeholder text"
                        id="question-placeholder"
                        value={placeholder}
                        onIonChange={(e) =>
                            handlePlaceholderChange(e)
                        }></IonInput>
                </IonItem>
            </IonList>
        );
    }
}

export default BaseText;
