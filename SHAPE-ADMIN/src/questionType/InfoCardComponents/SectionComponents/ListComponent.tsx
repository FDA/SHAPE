import {
    IonTextarea,
    IonList,
    IonListHeader,
    IonIcon,
    IonReorderGroup,
    IonItem,
    IonReorder
} from '@ionic/react';
import React from 'react';
import {
    addCircleOutline,
    reorderTwoOutline,
    trashOutline
} from 'ionicons/icons';
import {guid, isEmptyObject} from '../../../utils/Utils';
import {ItemReorderEventDetail} from '@ionic/core';
import {
    InfoCardListSection,
    InfoCardListItem
} from '../../../interfaces/DataTypes';
const arrayMove = require('array-move');

interface PassedProps {
    section: InfoCardListSection;
    storeSection: Function;
    index: number;
}

class ListComponent extends React.Component<PassedProps, {}> {
    addChoice = () => {
        let {storeSection, section, index} = this.props;
        let choices = !isEmptyObject(section.choices) ? section.choices : [];
        choices.push({
            value: '',
            text: '',
            index: guid()
        });
        section.choices = choices;
        storeSection(index, section);
    };

    handleChoiceTextChange(e: any, i: number) {
        let {storeSection, section, index} = this.props;
        let tempArray = section.choices;
        tempArray[i].text = e.target.value;
        section.choices = tempArray;
        storeSection(index, section);
    }

    deleteChoice(i: number) {
        let {storeSection, section, index} = this.props;
        let tempArray = section.choices;
        tempArray.splice(i, 1);
        section.choices = tempArray;
        storeSection(index, section);
    }

    render() {
        let {section, storeSection, index} = this.props;
        let choices = !isEmptyObject(section.choices) ? section.choices : [];

        let doReorder = (event: CustomEvent<ItemReorderEventDetail>) => {
            event.stopPropagation();
            choices = arrayMove(choices, event.detail.from, event.detail.to);
            section.choices = choices;
            storeSection(index, section);
            event.detail.complete();
        };

        return (
            <IonList lines="full" class="ion-no-margin ion-no-padding">
                <IonListHeader>
                    Choices&nbsp;&nbsp;
                    <IonIcon
                        icon={addCircleOutline}
                        style={{
                            cursor: 'pointer',
                            verticalAlign: 'middle'
                        }}
                        onClick={() => this.addChoice()}
                    />
                </IonListHeader>
                <IonReorderGroup disabled={false} onIonItemReorder={doReorder}>
                    {choices.map((choice: InfoCardListItem, i: number) => {
                        return (
                            <IonItem lines="inset" key={choice.index}>
                                <IonTextarea
                                    rows={1}
                                    placeholder="Display Text..."
                                    value={choice.text}
                                    onBlur={(e) =>
                                        this.handleChoiceTextChange(e, i)
                                    }
                                />
                                <IonIcon
                                    slot="end"
                                    icon={trashOutline}
                                    style={{cursor: 'pointer'}}
                                    onClick={() => this.deleteChoice(i)}
                                />
                                <IonReorder slot="start">
                                    <IonIcon icon={reorderTwoOutline} />
                                </IonReorder>
                            </IonItem>
                        );
                    })}
                </IonReorderGroup>
            </IonList>
        );
    }
}
export default ListComponent;
