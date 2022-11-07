import React, { Component } from 'react';
import { IonList, IonItem, IonLabel, IonText, IonSelect, IonSelectOption } from '@ionic/react';
import { FORMATS } from '../utils/Constants';

interface Props {
    format: string;
    setFormat: Function;
}

interface FormatDropdownProps {
    format: string;
    setFormat: Function;
}

const FormatDropdown = (props: FormatDropdownProps) => {
    let { format, setFormat } = props;
    return (
        <IonItem
            style={{
                marginTop: '0px',
                height: '60%',
                width: '100%'
            }}>
            <IonSelect
                value={format}
                multiple={false}
                cancelText='Cancel'
                okText='Ok'
                onIonChange={(e) => setFormat(e.detail.value)}>
                {(function getSelect(formatList) {
                    return formatList.map((e: { name: string; formatStr: string }) => {
                        return (
                            <IonSelectOption key={e.formatStr} value={e.formatStr}>
                                {e.name}
                            </IonSelectOption>
                        );
                    });
                })(FORMATS)}
            </IonSelect>
        </IonItem>
    );
};

class BaseDateTime extends Component<Props> {
    render() {
        let { format, setFormat } = this.props;

        return (
            <IonList lines='full' class='ion-no-margin ion-no-padding'>
                <IonItem>
                    <IonLabel position='stacked'>
                        Format<IonText color='danger'>*</IonText>
                    </IonLabel>
                    <FormatDropdown format={format} setFormat={setFormat} />
                </IonItem>
            </IonList>
        );
    }
}

export default BaseDateTime;
