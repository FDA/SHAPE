import React, { Component } from 'react';
import './QuestionType.css';
import { IonList, IonItem, IonLabel, IonInput, IonRange, IonGrid, IonRow, IonCol } from '@ionic/react';

interface Props {
    min: string;
    max: string;
    step: string;
    pin: boolean;
    ticks: boolean;
    sliderValue: number;
    handleInputChange: Function;
}

class BaseSlider extends Component<Props> {
    render() {
        let { sliderValue, pin, min, max, step, handleInputChange } = this.props;
        return (
            <IonList lines='full' class='ion-no-margin ion-no-padding'>
                <IonGrid class={'sliderGrid'}>
                    <IonRow>
                        <IonCol size='4' class={'sliderCol'}>
                            <IonItem>
                                <IonLabel>Lower:</IonLabel>
                                <IonInput
                                    name='min'
                                    type='number'
                                    value={min}
                                    onIonChange={(e) => handleInputChange(e)}
                                />
                            </IonItem>
                        </IonCol>
                        <IonCol size='4' class={'sliderCol'}>
                            <IonItem>
                                <IonLabel>Upper:</IonLabel>
                                <IonInput
                                    type='number'
                                    name='max'
                                    value={max}
                                    onIonChange={(e) => handleInputChange(e)}
                                />
                            </IonItem>
                        </IonCol>
                        <IonCol size='4' class={'sliderCol'}>
                            <IonItem>
                                <IonLabel>Step:</IonLabel>
                                <IonInput
                                    type='number'
                                    name='step'
                                    value={step}
                                    onIonChange={(e) => handleInputChange(e)}
                                />
                            </IonItem>
                        </IonCol>
                    </IonRow>
                </IonGrid>
                <IonItem>
                    <IonLabel position='stacked'>
                        {`Value: ${sliderValue} Lower: ${min} Upper: ${max} Step: ${step}`}
                    </IonLabel>
                    <IonRange
                        name='sliderValue'
                        dualKnobs={false}
                        min={parseInt(min)}
                        max={parseInt(max)}
                        step={parseInt(step)}
                        snaps={true}
                        pin={pin}
                        ticks={true}
                        onIonChange={(e) => handleInputChange(e)}
                    />
                </IonItem>
            </IonList>
        );
    }
}

export default BaseSlider;
