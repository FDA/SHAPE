import React, { Component } from "react";
import {
  IonContent,
  IonCard,
  IonCardContent,
  IonPage,
} from "@ionic/react";
import AppHeader from "../layout/AppHeader";
import { routes } from "../../utils/Constants";
import { connect } from "react-redux";
import {FirebaseAuth} from "../../interfaces/DataTypes";

interface PassedProps {
  fireBaseAuth: FirebaseAuth
}

interface PublicPrivateQueryState {}

class PublicPrivateQuery extends Component<PassedProps, PublicPrivateQueryState> {
  render = () => {
    return (
      <IonPage>
        <AppHeader showHeader={true} text={"Registration"} />
        <IonContent className="ion-padding">
            <IonCard button={true} routerLink={this.props.fireBaseAuth.isEmpty ? routes.ORG_QUERY : routes.TAB_ORG_QUERY}>
                <IonCardContent>I have a registration code.</IonCardContent>
            </IonCard>
            <IonCard button={true} routerLink={this.props.fireBaseAuth.isEmpty ? routes.ADD_PARTICIPANTS_QUERY : routes.TAB_PUBLIC_ORG_QUERY}>
                <IonCardContent>I do not have a registration code.</IonCardContent>
            </IonCard>
        </IonContent>
      </IonPage>
    );
  };
}

const mapStateToProps = (state: any) => ({
  fireBaseAuth: state.firebase.auth,
});

export default connect(mapStateToProps)(PublicPrivateQuery);
