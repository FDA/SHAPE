import React, { Component } from "react";

import {
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonPage,
  IonSelect,
  IonSelectOption,
  SelectChangeEventDetail,
} from "@ionic/react";
import Loading from "../layout/Loading";
import AppHeader from "../layout/AppHeader";
import { isEmptyObject } from "../../utils/Utils";
import { Choice } from "../../interfaces/DataTypes";
import { routes } from "../../utils/Constants";

interface PassedProps {
  toggleLoading: Function;
  loading: boolean;
  orgs: Choice[];
  selectOrg: Function;
  isEmpty: boolean;
}

interface OrgLookupState {
  selectedOrg: string;
  error: boolean;
}

class OrgLookup extends Component<PassedProps, OrgLookupState> {
  constructor(props: PassedProps) {
    super(props);
    this.state = {
      selectedOrg: "",
      error: false,
    };
  }

  handleOrgChange = (event: CustomEvent<SelectChangeEventDetail<any>>) => {
    const { value } = event.target as HTMLInputElement;
    this.setState({
      selectedOrg: value,
    });
    this.props.selectOrg(value);
  }

  render = () => {
    const { loading, orgs, isEmpty } = this.props;
    const { selectedOrg } = this.state;
    const LoadingIndicator = loading ? <Loading /> : null;
    const routerLink = isEmpty ? routes.PARTICIPANT_QUERY : routes.TAB_PARTICIPANT_QUERY

    return (
      <IonPage>
        <AppHeader showHeader={true} text={"Select Organization"} />
        <IonContent className="ion-padding">
            <p className="small-text">
                Please select the organization from which you received an invitation to join.
            </p>
            {LoadingIndicator}
            <IonItem>
                <IonLabel style={{ textAlignVertical: "top" }} position="stacked">
                    Organization
                </IonLabel>
                <IonSelect
                    data-testid="org-select"
                    className="rounded-input"
                    name={`orgSelect`}
                    okText="Ok"
                    cancelText="Cancel"
                    onIonChange={(e) => this.handleOrgChange(e)}
                    value={selectedOrg}
                    placeholder={selectedOrg}
                >
                    {orgs.map((org, index) => {
                    return (
                        <IonSelectOption key={index} value={org.id}>
                        {org.name}
                        </IonSelectOption>
                    );
                    })}
                </IonSelect>
            </IonItem>
            <IonButton
                expand="block"
                fill="solid"
                id="participant-query"
                routerLink={routerLink}
                color="primary"
                disabled={isEmptyObject(selectedOrg)}
                >
                Next
            </IonButton>
        </IonContent>
      </IonPage>
    );
  };
}

export default OrgLookup;
