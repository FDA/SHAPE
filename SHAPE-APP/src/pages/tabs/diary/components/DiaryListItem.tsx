import React, { Component } from "react";
import { IonItem, IonLabel } from "@ionic/react";
import "../Diary.css";

interface DLItemProps {
  setDisplayedItem: Function;
  data: string;
  title: string;
  displayedItem: string;
  setDisplayedData: Function;
}

interface DLItemState {}

class DiaryListItem extends Component<DLItemProps, DLItemState> {
  render() {
    return (
      <IonItem
        lines="full"
        onClick={() => {
          this.props.setDisplayedItem(this.props.title);
          this.props.setDisplayedData(this.props.data);
        }}
        detail={true}
      >
        <IonLabel>{this.props.title}</IonLabel>
      </IonItem>
    );
  }
}

export default DiaryListItem;
