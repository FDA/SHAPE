import {
    IonCard,
    IonCardContent,
    IonButton,
    IonGrid,
    IonTextarea,
    IonRow,
    IonCol
} from '@ionic/react';
import React from 'react';
import {isEmptyObject} from '../../../utils/Utils';
import {chunk} from 'lodash';
import {
    InfoCardTableSection,
    InfoCardTableCell
} from '../../../interfaces/DataTypes';

interface PassedProps {
    section: InfoCardTableSection;
    storeSection: Function;
    index: number;
}

interface State {
    colCount: number;
    rowCount: number;
    cells: Array<InfoCardTableCell>;
}

class TableComponent extends React.Component<PassedProps, State> {
    constructor(props: PassedProps) {
        super(props);
        this.state = {
            colCount: 0,
            rowCount: 0,
            cells: []
        };
    }

    componentDidMount() {
        let {section} = this.props;
        if (!isEmptyObject(section.colCount)) {
            this.setState({
                colCount: section.colCount
            });
        }
        if (!isEmptyObject(section.rowCount)) {
            this.setState({
                rowCount: section.rowCount
            });
        }
        if (!isEmptyObject(section.rowCount)) {
            this.setState({
                cells: section.cells
            });
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps: PassedProps) {
        let {section} = nextProps;
        if (!isEmptyObject(section.colCount)) {
            this.setState({
                colCount: section.colCount
            });
        }
        if (!isEmptyObject(section.rowCount)) {
            this.setState({
                rowCount: section.rowCount
            });
        }
        if (!isEmptyObject(section.rowCount)) {
            this.setState({
                cells: section.cells
            });
        }
    }

    addRow = () => {
        let {section, storeSection, index} = this.props;
        let {cells, colCount, rowCount} = this.state;

        if (colCount === 0 && rowCount === 0) {
            let newCell = {
                row: 0,
                col: 0,
                value: ''
            };
            cells.push(newCell);

            rowCount++;
            colCount++;
        } else {
            for (let i = 0; i < colCount; i++) {
                let newCell = {
                    row: rowCount,
                    col: i,
                    value: ''
                };
                cells.push(newCell);
            }
            rowCount++;
        }

        this.setState({
            rowCount: rowCount,
            colCount: colCount,
            cells: cells
        });
        section.cells = cells;
        section.rowCount = rowCount;
        section.colCount = colCount;
        storeSection(index, section);
    };

    addCol = () => {
        let {section, storeSection, index} = this.props;
        let {cells, colCount, rowCount} = this.state;

        if (colCount === 0 && rowCount === 0) {
            let newCell = {
                row: 0,
                col: 0,
                value: ''
            };
            cells.push(newCell);
            rowCount++;
            colCount++;
        } else {
            for (let i = 0; i < rowCount; i++) {
                let newCell = {
                    row: i,
                    col: colCount,
                    value: ''
                };
                cells.push(newCell);
            }
            colCount++;
        }

        this.setState({
            rowCount: rowCount,
            colCount: colCount,
            cells: cells
        });
        section.cells = cells;
        section.rowCount = rowCount;
        section.colCount = colCount;
        storeSection(index, section);
    };

    removeRow = () => {
        let {section, storeSection, index} = this.props;
        let {cells, colCount, rowCount} = this.state;

        if (colCount === 0 && rowCount === 0) {
            // do nothing
        } else if (rowCount === 1) {
            cells = [];
            rowCount = 0;
            colCount = 0;
        } else {
            cells = cells.filter((cell: InfoCardTableCell) => {
                return cell.row !== rowCount - 1;
            });
            rowCount--;
        }

        this.setState({
            rowCount: rowCount,
            colCount: colCount,
            cells: cells
        });
        section.cells = cells;
        section.rowCount = rowCount;
        section.colCount = colCount;
        storeSection(index, section);
    };

    removeCol = () => {
        let {section, storeSection, index} = this.props;
        let {cells, colCount, rowCount} = this.state;

        if (colCount === 0 && rowCount === 0) {
            // do nothing
        } else if (colCount === 1) {
            cells = [];
            rowCount = 0;
            colCount = 0;
        } else {
            cells = cells.filter((cell: InfoCardTableCell) => {
                return cell.col !== colCount - 1;
            });
            colCount--;
        }

        this.setState({
            rowCount: rowCount,
            colCount: colCount,
            cells: cells
        });
        section.cells = cells;
        section.rowCount = rowCount;
        section.colCount = colCount;
        storeSection(index, section);
    };

    setText = (cell: InfoCardTableCell, value: string) => {
        let {cells} = this.state;
        let {row, col} = cell;
        this.setState({
            cells: cells.map((tableCell: InfoCardTableCell) => {
                if (tableCell.row === row && tableCell.col === col) {
                    tableCell.value = value;
                }
                return tableCell;
            })
        });
    };

    render() {
        let {storeSection, section, index} = this.props;
        let {colCount, cells} = this.state;
        cells = cells.sort(
            (cell1: InfoCardTableCell, cell2: InfoCardTableCell) => {
                return cell1.row - cell2.row;
            }
        );
        let chunkedData = !isEmptyObject(cells) ? chunk(cells, colCount) : [];

        return (
            <>
                <IonButton color="primary" onClick={() => this.addRow()}>
                    + Row
                </IonButton>
                <IonButton color="primary" onClick={() => this.addCol()}>
                    + Col
                </IonButton>
                <IonButton
                    color="primary"
                    fill="outline"
                    onClick={() => this.removeRow()}>
                    - Row
                </IonButton>
                <IonButton
                    color="primary"
                    fill="outline"
                    onClick={() => this.removeCol()}>
                    - Col
                </IonButton>
                <IonCard>
                    <IonCardContent>
                        <IonGrid>
                            {chunkedData.map((row: any, i: number) => {
                                return (
                                    <IonRow key={`row-${i}`}>
                                        {row.map((col: any) => {
                                            return (
                                                <IonCol
                                                    style={{
                                                        border: '1px solid grey'
                                                    }}
                                                    key={`${col.row}-${col.col}`}>
                                                    <IonTextarea
                                                        style={{padding: '0px'}}
                                                        value={col.value}
                                                        rows={1}
                                                        cols={10}
                                                        placeholder="Text..."
                                                        onIonChange={(
                                                            e: any
                                                        ) => {
                                                            this.setText(
                                                                col,
                                                                e.detail.value
                                                            );
                                                        }}
                                                        onIonBlur={() => {
                                                            section.cells = cells;
                                                            storeSection(
                                                                index,
                                                                section
                                                            );
                                                        }}
                                                    />
                                                </IonCol>
                                            );
                                        })}
                                    </IonRow>
                                );
                            })}
                        </IonGrid>
                    </IonCardContent>
                </IonCard>
            </>
        );
    }
}
export default TableComponent;
