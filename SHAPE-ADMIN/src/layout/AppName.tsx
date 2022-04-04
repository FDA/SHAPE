import React from "react";
import {IonText} from "@ionic/react";

const AppName: React.FC = (props) => {
    const styles = {
        firstChar: {
            color: "#FF8C73",
            fontFamily: "Comfortaa",
            fontSize: "28px"
        },
        rest: {
            color: "#86888f",
            fontFamily: "Comfortaa",
            fontSize: "24px"

        }
    }

    return (
        <IonText><h2><span style={styles.firstChar}>S</span><span style={styles.rest}>urvey of </span>
            <span style={styles.firstChar}>H</span><span style={styles.rest}>ealth </span>
            <span style={styles.firstChar}>A</span><span style={styles.rest}>nd </span>
            <span style={styles.firstChar}>P</span><span style={styles.rest}>atient </span>
            <span style={styles.firstChar}>E</span><span style={styles.rest}>xperience</span></h2></IonText>
    )
}

export default AppName;




