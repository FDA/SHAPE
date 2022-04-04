import React from "react";
import { IonLoading } from "@ionic/react";

const Loading: React.FC = () => {
  return (
    <IonLoading isOpen={true} spinner="bubbles" message="Hang on a sec..." />
  );
};

export default Loading;
