import React, {Component} from 'react';
import {IonButton, IonContent, IonPage, IonText} from '@ionic/react';
import {connect} from 'react-redux';
import { addDoc, collection, getFirestore } from 'firebase/firestore';
import {FirebaseAuth} from '../interfaces/DataTypes';
import {collections, routes} from '../utils/Constants';

interface Props {
    fireBaseAuth: FirebaseAuth;
}

interface State {
    hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {hasError: false};
    }

    async componentDidCatch(error: any, info: any) {
        // Display fallback UI
        this.setState({hasError: true});
        const { uid } = this.props.fireBaseAuth;
        const firestore = getFirestore();
        const docRef = collection(firestore, collections.ERRORS)
        const docData = {
            uid: uid,
            errMessage: error.message,
            errStack: error.stack,
            info: info
        };
        try {
         await addDoc(docRef, docData);
        } catch (e) {
            console.error(`Error: ${e}`);
        }
    }

    render() {
        return this.state.hasError ? (
            <IonPage style={{textAlign: 'center'}}>
                <IonContent className="ion-padding">
                    <IonText>
                        <h1>
                            An Unexpected Error has occurred. Please contact
                            your adminsitrator
                        </h1>
                    </IonText>
                    <IonButton
                        type="button"
                        href={routes.LOGIN_CARD}
                        style={{marginTop: '1.5em'}}
                        expand="block"
                        fill="solid"
                        color="primary">
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
    fireBaseAuth: state.firebase.auth
});

export default connect(mapStateToProps)(ErrorBoundary);
