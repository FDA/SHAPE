import React from "react";
import { ColoredLineProps } from "../../../interfaces/Components";

export const ColoredLine: React.FC<ColoredLineProps> = ({
  color = "#d7d8da",
  backgroundColor = "#d7d8da",
  height = 2,
}) => (
  <hr
    style={{
      color: color,
      backgroundColor: backgroundColor,
      height: height,
    }}
  />
);
