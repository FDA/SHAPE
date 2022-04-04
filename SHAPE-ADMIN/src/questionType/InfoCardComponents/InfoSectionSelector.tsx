import {IonAlert} from '@ionic/react';
import React from 'react';
import {SECTIONTYPES} from '../../utils/Constants';
import {guid, isEmptyObject} from '../../utils/Utils';

interface PassedProps {
    addSection: Function;
    toggleSectionSelector: Function;
    showAlert: boolean;
}

class InfoSectionSelector extends React.Component<PassedProps, {}> {
    render() {
        let {showAlert, toggleSectionSelector, addSection} = this.props;
        return (
            <IonAlert
                isOpen={showAlert}
                onDidDismiss={() => toggleSectionSelector(false)}
                header={'Select Section Type'}
                inputs={SECTIONTYPES.map((type: any) => {
                    return {
                        name: type.key,
                        type: 'radio',
                        label: type.value,
                        value: type.key
                    };
                })}
                buttons={[
                    {
                        text: 'Cancel',
                        role: 'cancel',
                        cssClass: 'secondary'
                    },
                    {
                        text: 'Ok',
                        handler: (selection: string) => {
                            if (!isEmptyObject(selection)) {
                                addSection({type: selection, id: guid()});
                            }
                        }
                    }
                ]}
            />
        );
    }
}
export default InfoSectionSelector;
