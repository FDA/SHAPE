import {IonCard, IonCardContent} from '@ionic/react';
import React from 'react';
import {isEmptyObject} from '../../utils/Utils';
import {RouteComponentProps, withRouter} from 'react-router-dom';
import {
    HeaderDisplayComponent,
    TextAreaDisplayComponent,
    ListDisplayComponent,
    TableDisplayComponent,
    ImageDisplayComponent
} from './DisplayComponents';
import {
    InfoCardTextSection,
    InfoCardListSection,
    InfoCardImageSection,
    InfoCardTableSection
} from '../../interfaces/DataTypes';
import {sectionTypes} from '../../utils/Constants';

interface PassedProps extends RouteComponentProps {
    sections: Array<any>;
}

class InfoCardDisplay extends React.Component<PassedProps, {}> {
    render() {
        let {sections} = this.props;
        return (
            <IonCard style={{height: '650px', maxWidth: '500px'}}>
                <IonCardContent style={{maxHeight: '99%', overflow: 'scroll'}}>
                    {isEmptyObject(sections) && <span>No Sections Added</span>}
                    {sections.map((section: any, index: number) => {
                        if (section.type === sectionTypes.BREAK) {
                            return <br key={index} />;
                        }
                        if (section.type === sectionTypes.HEADER) {
                            return (
                                <HeaderDisplayComponent
                                    index={index}
                                    section={section as InfoCardTextSection}
                                    key={index}
                                />
                            );
                        }
                        if (section.type === sectionTypes.TEXTAREA) {
                            return (
                                <TextAreaDisplayComponent
                                    index={index}
                                    section={section as InfoCardTextSection}
                                    key={index}
                                />
                            );
                        }
                        if (section.type === sectionTypes.LIST) {
                            return (
                                <ListDisplayComponent
                                    section={section as InfoCardListSection}
                                    key={index}
                                />
                            );
                        }
                        if (section.type === sectionTypes.TABLE) {
                            return (
                                <TableDisplayComponent
                                    section={section as InfoCardTableSection}
                                    key={index}
                                />
                            );
                        }
                        if (section.type === sectionTypes.IMAGE) {
                            return (
                                <ImageDisplayComponent
                                    section={section as InfoCardImageSection}
                                    key={index}
                                />
                            );
                        }
                        return null;
                    })}
                </IonCardContent>
            </IonCard>
        );
    }
}
export default withRouter(InfoCardDisplay);
