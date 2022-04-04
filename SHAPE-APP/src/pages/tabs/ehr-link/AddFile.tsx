import React from "react";
import { useFirebase } from "react-redux-firebase";
import { User, EHR, Person, EHRReceipt } from "../../../interfaces/DataTypes";
import { collections } from "../../../utils/Constants";
import { isEmptyObject } from "../../../utils/Utils";
import { formatISO } from "date-fns";
import { IonButton } from "@ionic/react";

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
  setDone: Function;
}

export default function AddFile(props: PassedProps) {
  const firebase = useFirebase();

  function addTestFile() {
    let {
      profile,
      uid,
      selectedEHR,
      patientId,
      selectedProfile,
      toggleLoading,
      data,
      resetEHR,
      setEHR,
      setDone,
    } = props;
    try {
      toggleLoading(true);
      const dataToStore = JSON.stringify(data);
      let dateString = Date.now().toString();
      const fullPath = `${profile.org}/ehr/${profile.participantId}/${
        selectedProfile.name
      }/${selectedProfile.dob.replace(
        /\D/g,
        ""
      )}/PatientId-${patientId}-healthrecord-${dateString}.json`;
      const shortPath = `${profile.participantId}/${
        selectedProfile.name
      }/${selectedProfile.dob.replace(
        /\D/g,
        ""
      )}/PatientId-${patientId}-healthrecord-${dateString}.json`;
      const storageRef = firebase.storage().ref();
      const fileRef = storageRef.child(fullPath);

      if (!profile.hasOwnProperty("linkedRecords")) {
        profile.linkedRecords = [];
      }
      //@ts-ignore
      profile.linkedRecords.push({ ehr: selectedEHR, patientId: patientId });
      return fileRef
        .putString(dataToStore)
        .then(() => {
          const fireStore = firebase.firestore();
          fireStore
            .collection(collections.USERS)
            .doc(uid)
            .set(profile, { merge: true })
            .then(() => {
              fireStore
                .collection(collections.EHR)
                .where("participantId", "==", profile.participantId)
                .where("org", "==", profile.org)
                .get()
                .then(function (querySnapshot) {
                  // will only return one or none
                  if (querySnapshot.empty) {
                    let receipt = {
                      path: shortPath,
                      profile: selectedProfile,
                      timestamp: formatISO(new Date()),
                      ehr: selectedEHR,
                    };
                    let receipts: Array<EHRReceipt> = [receipt];
                    fireStore
                      .collection(collections.EHR)
                      .add({
                        org: profile.org,
                        receipts: receipts,
                        participantId: profile.participantId,
                      })
                      .then(() => {
                        setDone(true);
                        resetEHR();
                        setEHR(receipts);
                        toggleLoading(false);
                      })
                      .catch((err) => {
                        console.error(`Unable to update ehr info ${err}`);
                      });
                  } else {
                    querySnapshot.forEach(function (doc) {
                      let receipt = {
                        path: shortPath,
                        profile: selectedProfile,
                        timestamp: formatISO(new Date()),
                        ehr: selectedEHR,
                        patientId: patientId,
                      };
                      let dat = doc.data();
                      let receipts = !isEmptyObject(dat.receipts)
                        ? dat.receipts
                        : [];
                      receipts.push(receipt);
                      fireStore
                        .collection(collections.EHR)
                        .doc(doc.id)
                        .set({ receipts: receipts }, { merge: true })
                        .then(() => {
                          setDone(true);
                          resetEHR();
                          setEHR(receipts);
                          toggleLoading(false);
                        })
                        .catch((err) => {
                          console.error(`Unable to update ehr info ${err}`);
                          toggleLoading(false);
                        });
                    });
                  }
                })
                .catch((err) => {
                  console.error(`Unable to get ehr info ${err}`);
                  toggleLoading(false);
                });
            })
            .catch((err) => {
              console.error(`Unable to update participant info ${err}`);
              toggleLoading(false);
            });
        })
        .catch((err) => {
          console.error("error uploading file", err);
          toggleLoading(false);
        });
    } catch (e) {
      console.error(`Unable to process EHR File ${e}`);
      toggleLoading(false);
    }
  }

  return (
    <IonButton
      id="complete"
      fill="solid"
      expand="block"
      onClick={() => addTestFile()}
    >
      Complete the process
    </IonButton>
  );
}
