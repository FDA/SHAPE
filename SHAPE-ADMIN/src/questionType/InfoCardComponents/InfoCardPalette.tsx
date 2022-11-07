import {
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonIcon,
    IonReorderGroup,
    IonTextarea,
    IonLabel,
    IonText,
    IonItem,
    IonButton
} from '@ionic/react';
import React from 'react';
import { isEmptyObject } from '../../utils/Utils';
import { addCircleOutline } from 'ionicons/icons';
import InfoCardSection from './InfoCardSection';
import InfoSectionSelector from './InfoSectionSelector';
import { ItemReorderEventDetail } from '@ionic/core';
const arrayMove = require('array-move');

interface InfoCardPaletteState {
    showSectionSelector: boolean;
}

interface PassedProps {
    editing: boolean;
    sections: any;
    variable: string;
    handleVariableChange: Function;
    storeSection: Function;
    addSection: Function;
    removeSection: Function;
    storeSections: Function;
}

class InfoCardPalette extends React.Component<PassedProps, InfoCardPaletteState> {
    constructor(props: PassedProps) {
        super(props);
        this.state = {
            showSectionSelector: false
        };
    }

    toggleSectionSelector = (bool: boolean) => {
        this.setState({ showSectionSelector: bool });
    };

    render() {
        let { showSectionSelector } = this.state;
        let {
            sections,
            variable,
            storeSection,
            addSection,
            removeSection,
            editing,
            storeSections,
            handleVariableChange
        } = this.props;

        let doReorder = (event: CustomEvent<ItemReorderEventDetail>) => {
            event.stopPropagation();
            sections = arrayMove(sections, event.detail.from, event.detail.to);
            storeSections(sections);
            event.detail.complete();
        };

        return (
            <>
                <IonCard style={{ height: '650px', maxWidth: '500px' }} disabled={!editing}>
                    <IonCardHeader>
                        <IonCardTitle>
                            <IonLabel>Palette </IonLabel>
                            <IonButton
                                fill='clear'
                                color='dark'
                                title='Palette'
                                onClick={() => this.toggleSectionSelector(true)}>
                                <IonIcon
                                    icon={addCircleOutline}
                                    title='Palette'
                                    style={{ cursor: 'pointer', fontSize: '20px', paddingBottom: '.75em' }}
                                />
                            </IonButton>
                        </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent style={{ maxHeight: '90%', overflow: 'scroll' }}>
                        <IonItem>
                            <IonLabel position='stacked'>
                                Variable<IonText color='danger'>*</IonText>
                            </IonLabel>
                            <IonTextarea
                                placeholder='A unique ID'
                                id='question-variable'
                                name='variable'
                                value={variable}
                                rows={1}
                                onIonChange={(e: any) => handleVariableChange(e)}></IonTextarea>
                        </IonItem>
                        <br />
                        {isEmptyObject(sections) && <span>No Sections Added *Required</span>}
                        {!isEmptyObject(sections) ? (
                            <IonReorderGroup disabled={false} onIonItemReorder={doReorder}>
                                {sections.map((section: any, index: any) => {
                                    return (
                                        <InfoCardSection
                                            section={section}
                                            storeSection={storeSection}
                                            removeSection={removeSection}
                                            index={index}
                                            key={section.id}
                                        />
                                    );
                                })}
                            </IonReorderGroup>
                        ) : null}
                    </IonCardContent>
                </IonCard>
                <InfoSectionSelector
                    addSection={addSection}
                    toggleSectionSelector={this.toggleSectionSelector}
                    showAlert={showSectionSelector}
                />
            </>
        );
    }
}
export default InfoCardPalette;
