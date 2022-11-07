import React, {Component} from 'react';
import {IonInput, IonItem, IonLabel, IonList} from '@ionic/react';

interface Props {
    handleMinChange: Function;
    handleMaxChange: Function;
    min: string;
    max: string;
}

class BaseRange extends Component<Props> {
    render() {
        let {handleMinChange, handleMaxChange, min, max} = this.props;

        return (
            <IonList lines="full" class="ion-no-margin ion-no-padding">
                <IonItem>
                    <IonLabel position="stacked">Minimum Value</IonLabel>
                    <IonInput
                        placeholder="min value number"
                        id="question-min"
                        value={min}
                        onIonChange={(e) => handleMinChange(e)}></IonInput>
                </IonItem>
                <IonItem>
                    <IonLabel position="stacked">Maximum Value</IonLabel>
                    <IonInput
                        placeholder="max value number"
                        id="question-max"
                        value={max}
                        onIonChange={(e) => handleMaxChange(e)}></IonInput>
                </IonItem>
            </IonList>
        );
    }
}

export default BaseRange;
