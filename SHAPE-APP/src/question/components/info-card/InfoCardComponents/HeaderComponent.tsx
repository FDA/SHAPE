import React from "react";
import { InfoCardTextSection } from "../../../../interfaces/DataTypes";

interface PassedProps {
  index: number;
  section: InfoCardTextSection;
}

class HeaderComponent extends React.Component<PassedProps, {}> {
  render() {
    let { section, index } = this.props;
    return <h1 key={index}>{section.value}</h1>;
  }
}
export default HeaderComponent;
