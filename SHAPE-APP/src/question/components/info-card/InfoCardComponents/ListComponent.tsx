import React from "react";
import { isEmptyObject } from "../../../../utils/Utils";
import {
  InfoCardListSection,
  InfoCardListItem,
} from "../../../../interfaces/DataTypes";

interface PassedProps {
  section: InfoCardListSection;
}

class ListComponent extends React.Component<PassedProps, {}> {
  render() {
    const { section } = this.props;
    const choices = !isEmptyObject(section.choices) ? section.choices : [];
    return (
      <ul>
        {choices.map((choice: InfoCardListItem, index: number) => {
          return <li key={index}>{choice.text}</li>;
        })}
      </ul>
    );
  }
}
export default ListComponent;
