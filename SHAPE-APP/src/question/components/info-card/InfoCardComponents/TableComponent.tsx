import { IonGrid, IonRow, IonCol } from "@ionic/react";
import React from "react";
import { isEmptyObject } from "../../../../utils/Utils";
import { chunk } from "lodash";
import {
  InfoCardTableSection,
  InfoCardTableCell,
} from "../../../../interfaces/DataTypes";

interface PassedProps {
  section: InfoCardTableSection;
}

class TableComponent extends React.Component<PassedProps, {}> {
  render() {
    let { section } = this.props;
    let cells = !isEmptyObject(section.cells) ? section.cells : [];
    let colCount = !isEmptyObject(section.colCount) ? section.colCount : 0;
    let orderedCells = cells.sort(
      (cell1: InfoCardTableCell, cell2: InfoCardTableCell) => {
        return cell1.row - cell2.row;
      }
    );
    let chunkedData = !isEmptyObject(orderedCells)
      ? chunk(orderedCells, colCount)
      : [];
    return (
      <IonGrid style={{ padding: "0px" }}>
        {chunkedData.map((row: Array<InfoCardTableCell>, i: number) => {
          return (
            <IonRow key={`row-${i}`}>
              {row.map((col: InfoCardTableCell) => {
                return (
                  <IonCol
                    style={{ border: "1px solid grey" }}
                    key={`${col.row}-${col.col}`}
                  >
                    {col.value}
                  </IonCol>
                );
              })}
            </IonRow>
          );
        })}
      </IonGrid>
    );
  }
}
export default TableComponent;
