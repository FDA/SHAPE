import React, { Component } from "react";
import { IonButton, IonContent, IonPage, IonText } from "@ionic/react";
import { connect } from "react-redux";
import AppHeader from "./AppHeader";
import { firebase } from "../../config";
import { FirebaseAuth } from "../../interfaces/DataTypes";
import { collections, images, routes } from "../../utils/Constants";

interface PassedProps {
  fireBaseAuth: FirebaseAuth;
  darkMode: boolean;
  children: any;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<PassedProps, ErrorBoundaryState> {
  constructor(props: PassedProps) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error: any, info: any) {
    // Display fallback UI
    this.setState({ hasError: true });
    const { fireBaseAuth } = this.props;
    const { uid } = fireBaseAuth;

    const fireStore = firebase.firestore();
    const docData = {
      uid: uid,
      errMessage: error.message,
      errStack: error.stack,
      info: info,
      occuredAt: firebase.firestore.Timestamp.fromDate(new Date()),
    };
    try {
      fireStore
        .collection(collections.ERRORS)
        .add(docData)
        .catch((err) => {
          console.error(err);
        });
    } catch (e) {
      console.error(`Error: ${e}`);
    }
  }

  render() {
    const { darkMode } = this.props;
    const logo = darkMode
      ? images.SHAPE_LOGO_HORIZONTAL_DARKMODE
      : images.SHAPE_LOGO_HORIZONTAL;
    return this.state.hasError ? (
      <IonPage style={{ textAlign: "center" }}>
        <AppHeader showHeader={true} text={"Error Boundary"} />
        <IonContent className="ion-padding">
          <img src={logo} alt="Shape logo" />
          <IonText>
            <h1>
              An Unexpected Error has occurred. Please contact your
              administrator
            </h1>
          </IonText>
          <IonButton
            type="button"
            href={routes.LOGIN_CARD}
            style={{ marginTop: "1.5em" }}
            expand="block"
            fill="solid"
            color="primary"
          >
            Home
          </IonButton>
        </IonContent>
      </IonPage>
    ) : (
      this.props.children
    );
  }
}

const mapStateToProps = (state: any) => ({
  darkMode: state.darkMode,
  fireBaseAuth: state.firebase.auth,
});

export default connect(mapStateToProps)(ErrorBoundary);
