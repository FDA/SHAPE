import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonFab,
  IonFabButton,
  IonGrid,
  IonIcon,
  IonList,
  IonRow,
  IonContent,
  IonPage,
  IonToolbar,
  IonHeader,
  IonTitle,
} from "@ionic/react";

import { addCircleOutline } from "ionicons/icons";
import { isEmptyObject } from "../../../utils/Utils";
import "./Diary.css";
import { DiaryDisplay, DiaryListItem } from "./components";
import { FirebaseAuth, DiaryResponse } from "../../../interfaces/DataTypes";
import { routes } from "../../../utils/Constants";

interface DiaryProps {
  setDisplay: Function;
  userDiaryEntries: Array<DiaryResponse>;
  fireBaseAuth: FirebaseAuth;
}

interface DiaryState {
  displayedItem: string;
  displayedData: string;
}

class Diary extends Component<DiaryProps, DiaryState> {
  constructor(props: DiaryProps) {
    super(props);
    this.state = {
      displayedItem: "",
      displayedData: "",
    };
  }

  setDisplayedItem = (displayedItem: string) => {
    this.setState({
      displayedItem,
    });
  };

  setDisplayedData = (displayedData: string) => {
    this.setState({
      displayedData: displayedData,
    });
  };

  render() {
    let { displayedItem, displayedData } = this.state;
    let { userDiaryEntries } = this.props;
    let sortedDiaries = [...userDiaryEntries].sort(
      (a: DiaryResponse, b: DiaryResponse) =>
        a.dateWritten < b.dateWritten ? 1 : -1
    );

    if (this.props.fireBaseAuth.isEmpty) {
      return <Redirect to={routes.LOGIN} />;
    }
    return (
      <IonPage className="diary-page">
        <IonHeader>
          <IonToolbar>
            <IonTitle>Self-Report</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          {isEmptyObject(displayedItem) && (
            <>
              {isEmptyObject(sortedDiaries) && (
                <IonCard style={{ textAlign: "center" }}>
                  <IonCardHeader>
                    <IonCardTitle>No Diaries Entries Available</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    Create a new entry by tapping the + button.
                  </IonCardContent>
                </IonCard>
              )}
              {!isEmptyObject(sortedDiaries) && (
                <IonList>
                  {sortedDiaries.map((elem: DiaryResponse) => {
                    return (
                      <DiaryListItem
                        key={`${elem.formType} ${elem.dateWritten}`}
                        title={`${elem.formType} ${elem.dateWritten}`}
                        displayedItem={this.state.displayedItem}
                        setDisplayedItem={this.setDisplayedItem}
                        setDisplayedData={this.setDisplayedData}
                        data={JSON.stringify(elem, null, 2)}
                      />
                    );
                  })}
                </IonList>
              )}
              <IonFab vertical="bottom" horizontal="end" slot="fixed">
                <IonFabButton routerLink={routes.NEW_DIARY_ENTRY}>
                  <IonIcon icon={addCircleOutline} />
                </IonFabButton>
              </IonFab>
            </>
          )}
          {!isEmptyObject(displayedItem) && (
            <IonGrid>
              <IonRow>
                <IonButton
                  fill="clear"
                  size="small"
                  onClick={() => {
                    this.setState({ displayedItem: "", displayedData: "" });
                  }}
                >{`< Back`}</IonButton>
              </IonRow>
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle color="primary">{displayedItem}</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <DiaryDisplay displayedData={displayedData} />
                </IonCardContent>
              </IonCard>
            </IonGrid>
          )}
        </IonContent>
      </IonPage>
    );
  }
}

export default Diary;
