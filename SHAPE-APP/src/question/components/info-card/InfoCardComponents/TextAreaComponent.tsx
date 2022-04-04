import React from "react";
import { InfoCardTextSection } from "../../../../interfaces/DataTypes";

interface PassedProps {
  index: number;
  section: InfoCardTextSection;
}

class TextAreaComponent extends React.Component<PassedProps, {}> {
  render() {
    let { section, index } = this.props;
    return <p key={index}>{section.value}</p>;
  }
}
export default TextAreaComponent;
