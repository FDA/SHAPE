import React from 'react';
import {isEmptyObject} from '../../../utils/Utils';
import {
    InfoCardListSection,
    InfoCardListItem
} from '../../../interfaces/DataTypes';

interface PassedProps {
    section: InfoCardListSection;
}

class ListDisplayComponent extends React.Component<PassedProps, {}> {
    render() {
        let {section} = this.props;
        let choices = !isEmptyObject(section.choices) ? section.choices : [];
        return (
            <ul>
                {choices.map((choice: InfoCardListItem, index: number) => {
                    return <li key={index}>{choice.text}</li>;
                })}
            </ul>
        );
    }
}
export default ListDisplayComponent;
