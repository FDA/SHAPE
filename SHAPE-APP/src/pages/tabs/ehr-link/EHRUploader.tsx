import React, { Component } from "react";
import { IonButton, IonToast } from "@ionic/react";
import Loading from "../../layout/Loading";
import { routes } from "../../../utils/Constants";
import { User, Person, EHR } from "../../../interfaces/DataTypes";
import AddFile from "./AddFile";

interface PassedProps {
  profile: User;
  uid: string;
  selectedEHR: EHR;
  patientId: string;
  selectedProfile: Person;
  setEHR: Function;
  toggleLoading: Function;
  loading: boolean;
  data: any;
  resetEHR: Function;
}

interface EHRUploaderState {
  done: boolean;
}

class EHRUploader extends Component<PassedProps, EHRUploaderState> {
  constructor(props: PassedProps) {
    super(props);
    this.state = { done: false };
  }

  setDone = (done: boolean) => {
    this.setState({ done: done });
  };

  render() {
    let {
      loading,
      profile,
      uid,
      selectedEHR,
      patientId,
      selectedProfile,
      setEHR,
      toggleLoading,
      data,
      resetEHR,
    } = this.props;
    let { done } = this.state;

    const butnLabel = !done ? "Quit without continuing" : "Home";
    return (
      <>
        {loading ? <Loading /> : null}
        {!done && (
          <AddFile
            setDone={this.setDone}
            profile={profile}
            uid={uid}
            selectedEHR={selectedEHR}
            patientId={patientId}
            selectedProfile={selectedProfile}
            setEHR={setEHR}
            toggleLoading={toggleLoading}
            loading={loading}
            data={data}
            resetEHR={resetEHR}
          />
        )}
        <>
          <IonButton
            id="complete"
            fill="solid"
            expand="block"
            routerLink={routes.TABS}
            color="light"
          >
            {butnLabel}
          </IonButton>

          <IonToast
            isOpen={done}
            color={"success"}
            duration={2000}
            message={"Your EHR Records have been successfully submitted"}
          />
        </>
      </>
    );
  }
}

export default EHRUploader;
