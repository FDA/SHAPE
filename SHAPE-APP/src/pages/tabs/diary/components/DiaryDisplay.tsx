import React from "react";
import { IonItem } from "@ionic/react";
import {
  optionsArr, //healthEvent
  outcomeChoices, //outcome
  treatmentChoices, //eventTreatment, postEventTreatment
  assessmentArr, //assessers
  GMFCArr, //GMFCType
  treatmentVals, //prescription
  deviceVals, //device
  ongoingArr, //ongoingStatus
  doctorVisit,
  withdrawl,
  he,
} from "../event-forms/DiaryMappings";

interface PassedProps {
  displayedData: string;
}

export const DiaryDisplay = (props: PassedProps) => {
  let { displayedData } = props;
  let data = JSON.parse(displayedData);
  delete data["participantId"];
  delete data["surveyId"];
  delete data["org"];
  const formType = data.formType;
  delete data["formType"];

  let keys: any = Object.keys(data);

  const getClinicalVisitLabel = (key: string) => {
    let value = data[key];
    if (key === "assessers") {
      for (let i = 0; i < value.length; i++) {
        let val = value[i];
        let valLookup = assessmentArr.find((item) => item.val === val) || {
          text: "",
        };
        value[i] = valLookup.text;
      }
    }
    if (key === "GMFCType") {
      let valLookup = GMFCArr.find((item) => item.val === value) || {
        text: "",
      };
      value = valLookup.text;
    }
    if (key === "treatmentVals") {
      let valLookup = treatmentVals.find((item) => item.val === value) || {
        text: "",
      };
      value = valLookup.text;
    }
    if (key === "device") {
      for (let i = 0; i < value.length; i++) {
        let val = value[i];
        let valLookup = deviceVals.find((item) => item.val === val) || {
          text: "",
        };
        value[i] = valLookup.text;
      }
    }
    return value;
  };

  const getHealthEventLabel = (key: string) => {
    let value = data[key];
    if (key === "healthEvent") {
      let valLookup = optionsArr.find((item) => item.val === value) || {
        text: "",
      };
      value = valLookup.text;
    }
    if (key === "outcome") {
      let valLookup = outcomeChoices.find((item) => item.val === value) || {
        text: "",
      };
      value = valLookup.text;
    }
    if (key === "eventTreatment" || key === "postEventTreatment") {
      let valLookup = treatmentChoices.find((item) => item.val === value) || {
        text: "",
      };
      value = valLookup.text;
    }

    if (key === "ongoingStatus") {
      let valLookup = ongoingArr.find((item) => item.val === value) || {
        text: "",
      };
      value = valLookup.text;
    }

    return value;
  };

  let displayData = keys.map(function (key: string) {
    if (formType === "Clinical Visit") {
      const label = doctorVisit.find((item) => item.label === key);
      if (label) {
        let keyValue = getClinicalVisitLabel(key);
        return `${label.value}: ${keyValue}`;
      }
    }

    if (formType === "Withdrawal") {
      const label = withdrawl.find((item) => item.label === key);
      if (label) {
        let keyValue = data[key];
        return `${label.value}: ${keyValue}`;
      }
    }

    if (formType === "Health Event") {
      const label = he.find((item) => item.label === key);
      if (label) {
        let keyValue = getHealthEventLabel(key);
        return `${label.value}: ${keyValue}`;
      }
    }

    let kv = data[key];
    return `${key}: ${kv}`;
  });

  return displayData.map((elem: any, index: number) => {
    return (
      <IonItem lines="none" key={index}>
        {elem}
      </IonItem>
    );
  });
};
