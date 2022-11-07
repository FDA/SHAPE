import React, { useState } from "react";
import { IonInput, IonLabel, IonItem } from "@ionic/react";

interface ContainerProps {
  inputHandler: Function;
  value: string | undefined;
  phoneNumber: string | undefined;
}

const PhoneNumberMaskInput: React.FC<ContainerProps> = (props) => {
  const [maskedInput, setMaskedInput] = useState(props.phoneNumber);

  const onMaskedInputChange = (newMaskedInput: string) => {
    setMaskedInput(normalizeInput(newMaskedInput));
  };

  const normalizeInput = (value: string) => {
    // only allows 0-9 inputs
    const currentValue = value.replace(/[^\d]/g, "");

    // returns: "x", "xx", "xxx"
    if (currentValue.length < 4) return currentValue;

    // returns: "(xxx)", "(xxx) x", "(xxx) xx", "(xxx) xxx",
    if (currentValue.length < 7)
      return `(${currentValue.slice(0, 3)}) ${currentValue.slice(3)}`;

    // returns: "(xxx) xxx-", (xxx) xxx-x", "(xxx) xxx-xx", "(xxx) xxx-xxx", "(xxx) xxx-xxxx"
    const retval =
      `(${currentValue.slice(0, 3)}) ` +
      `${currentValue.slice(3, 6)}-${currentValue.slice(6, 10)}`;
    props.inputHandler(retval);
    return retval;
  };

  return (
    <IonItem style={{marginBottom: ".5em"}}>
      <IonLabel position="stacked">Telephone Number (Voice and SMS)</IonLabel>
      <IonInput
        inputMode="tel"
        value={maskedInput}
        onIonChange={(e: any) => onMaskedInputChange(e.detail.value)}
        placeholder="(___) ___-____"
        maxlength={14}
        defaultValue={props.value}
        required={true}
      />
    </IonItem>
  );
};

export default PhoneNumberMaskInput;
