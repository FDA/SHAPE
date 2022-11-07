import { IonCard, IonCardContent, IonIcon, IonItem, IonReorder } from '@ionic/react';
import React from 'react';
import {
    TextAreaComponent,
    HeaderComponent,
    ListComponent,
    TableComponent,
    ImageComponent
} from './SectionComponents';
import { trashOutline, reorderTwoOutline } from 'ionicons/icons';
import { sectionTypes } from '../../utils/Constants';

interface PassedProps {
    section: any;
    storeSection: Function;
    removeSection: Function;
    index: number;
}

class InfoCardSection extends React.Component<PassedProps, {}> {
    render() {
        let { section, storeSection, index } = this.props;
        return (
            <IonItem lines='none'>
                <IonCard style={{ width: '100%' }}>
                    <IonCardContent style={{ padding: '5px' }}>
                        {section.type === sectionTypes.TEXTAREA && (
                            <TextAreaComponent section={section} storeSection={storeSection} index={index} />
                        )}
                        {section.type === sectionTypes.HEADER && (
                            <HeaderComponent section={section} storeSection={storeSection} index={index} />
                        )}
                        {section.type === sectionTypes.LIST && (
                            <ListComponent section={section} storeSection={storeSection} index={index} />
                        )}
                        {section.type === sectionTypes.TABLE && (
                            <TableComponent section={section} storeSection={storeSection} index={index} />
                        )}
                        {section.type === sectionTypes.IMAGE && (
                            <ImageComponent section={section} storeSection={storeSection} index={index} />
                        )}
                    </IonCardContent>
                </IonCard>
                <IonIcon
                    icon={trashOutline}
                    style={{ cursor: 'pointer' }}
                    title='delete'
                    onClick={() => this.props.removeSection(index)}
                />
                <IonReorder slot='start'>
                    <IonIcon icon={reorderTwoOutline} />
                </IonReorder>
            </IonItem>
        );
    }
}
export default InfoCardSection;
