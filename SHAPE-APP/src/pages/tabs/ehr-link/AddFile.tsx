import React from 'react';
import { User, EHR, Person, EHRReceipt, Survey } from '../../../interfaces/DataTypes';
import { collections } from '../../../utils/Constants';
import { isEmptyObject } from '../../../utils/Utils';
import { formatISO } from 'date-fns';
import { IonButton } from '@ionic/react';
import {
    addDoc,
    collection,
    doc,
    getDocs,
    getFirestore,
    query,
    QuerySnapshot,
    setDoc,
    where
} from 'firebase/firestore';
import { getStorage, ref, uploadString } from 'firebase/storage';

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
    disabled: boolean;
    selectedSurvey: Survey | null;
}

export default function AddFile(props: PassedProps) {
    const firestore = getFirestore();
    const fbStorage = getStorage();

    const {
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
        disabled,
        selectedSurvey
    } = props;

    function addTestFile() {
        try {
            toggleLoading(true);

            //@ts-ignore
            const participantId = selectedSurvey.public
                ? uid
                : profile.participantId.filter((elem: any) => {
                      //@ts-ignore
                      return elem.org === selectedSurvey.org;
                  })[0].id;

            const reset = () => {
                setDone(true);
                resetEHR();
                setEHR();
                toggleLoading(false);
            };

            const dataToStore = JSON.stringify(data);
            const dateString = Date.now().toString();
            //@ts-ignore
            const fullPath = `${selectedSurvey.org}/ehr/${selectedSurvey.id}/${participantId}/${selectedProfile.id}/PatientId-${patientId}-healthrecord-${dateString}.json`;
            //@ts-ignore
            const shortPath = `${selectedSurvey.id}/${participantId}/${selectedProfile.id}/PatientId-${patientId}-healthrecord-${dateString}.json`;
            const storageRef = ref(fbStorage);
            const fileRef = ref(storageRef, fullPath);

            if (!profile.hasOwnProperty('linkedRecords')) {
                profile.linkedRecords = [];
            }
            //@ts-ignore
            profile.linkedRecords.push({ ehr: selectedEHR, patientId: patientId });
            return uploadString(fileRef, dataToStore) //not 100% sure if should be fileRef or storageRef, need to test
                .then(() => {
                    const docRef = doc(firestore, collections.USERS, uid);
                    setDoc(docRef, profile, { merge: true })
                        .then(() => {
                            const q = query(
                                collection(firestore, collections.EHR),
                                where('userId', '==', uid),
                                //@ts-ignore
                                where('surveyId', '==', selectedSurvey.id)
                            );
                            getDocs(q)
                                .then((querySnapshot: QuerySnapshot) => {
                                    // will only return one or none
                                    if (querySnapshot.empty) {
                                        const receipt = {
                                            path: shortPath,
                                            profile: selectedProfile,
                                            timestamp: formatISO(new Date()),
                                            ehr: selectedEHR,
                                            patientId: patientId
                                        };
                                        const receipts: Array<EHRReceipt> = [receipt];
                                        const collectionRef = collection(firestore, collections.EHR);
                                        addDoc(collectionRef, {
                                            //@ts-ignore
                                            surveyId: selectedSurvey.id,
                                            receipts: receipts,
                                            participantId: participantId,
                                            //@ts-ignore
                                            org: selectedSurvey.org,
                                            userId: uid
                                        })
                                            .then(() => {
                                                reset();
                                            })
                                            .catch((err: any) => {
                                                console.error(`Unable to update ehr info ${err}`);
                                            });
                                    } else {
                                        querySnapshot.forEach((document: any) => {
                                            const receipt = {
                                                path: shortPath,
                                                profile: selectedProfile,
                                                timestamp: formatISO(new Date()),
                                                ehr: selectedEHR,
                                                patientId: patientId
                                            };
                                            const dat = document.data();
                                            const receipts = !isEmptyObject(dat.receipts) ? dat.receipts : [];
                                            receipts.push(receipt);
                                            const dRef = doc(firestore, collections.EHR, document.id);
                                            setDoc(dRef, { receipts: receipts }, { merge: true })
                                                .then(() => {
                                                    reset();
                                                })
                                                .catch((err: any) => {
                                                    console.error(`Unable to update ehr info ${err}`);
                                                    toggleLoading(false);
                                                });
                                        });
                                    }
                                })
                                .catch((err: any) => {
                                    console.error(`Unable to get ehr info ${err}`);
                                    toggleLoading(false);
                                });
                        })
                        .catch((err: any) => {
                            console.error(`Unable to update participant info ${err}`);
                            toggleLoading(false);
                        });
                })
                .catch((err: any) => {
                    console.error('error uploading file', err);
                    toggleLoading(false);
                });
        } catch (e) {
            console.error(`Unable to process EHR File ${e}`);
            toggleLoading(false);
        }
    }

    return (
        <IonButton
            id='complete'
            fill='solid'
            expand='block'
            disabled={disabled}
            onClick={() => addTestFile()}>
            Complete the process
        </IonButton>
    );
}
