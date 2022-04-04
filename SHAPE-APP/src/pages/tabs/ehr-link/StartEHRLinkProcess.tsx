import React, { Component } from "react";
import {
   IonButton,
   IonContent,
   IonItem,
   IonLabel,
   IonList,
   IonPage,
   IonSearchbar
} from "@ionic/react";
import AppHeader from "../../layout/AppHeader";
import { FirebaseAuth, Person, EHR } from "../../../interfaces/DataTypes";
import { isEmptyObject } from "../../../utils/Utils";
import Loading from "../../layout/Loading";
import "../../../theme/variables.css";
const firebase = require("firebase");
require("firebase/firestore");

interface PassedProps {
   ehr: any;
   getEHRUserCode: Function;
   auth: FirebaseAuth;
   getEhrAccessCode: Function;
   getEhrBearerToken: Function;
   isLoading: Function;
   providerSearch: Function;
   selectedProfile: Person;
   setTargetEHR: Function;
   clearSearch: Function;
   loading: boolean;
}

interface StartEHRLinkProcessState {
   searchText: string;
   accesscodeFetched: boolean;
   bearerTokenFetched: boolean;
}

class StartEHRLinkProcess extends Component<
   PassedProps,
   StartEHRLinkProcessState
> {
   constructor(props: PassedProps) {
      super(props);
      this.state = {
         searchText: "",
         accesscodeFetched: false,
         bearerTokenFetched: false,
      };
   }

   UNSAFE_componentWillReceiveProps(nextProps: PassedProps) {
      let { ehr, auth } = nextProps;
      let { accesscodeFetched, bearerTokenFetched } = this.state;

      if (ehr && !ehr.OneUpUserId && !ehr.appUserId) {
         this.props.getEHRUserCode(auth.uid);
      } else if (ehr && !ehr.accesscode && !accesscodeFetched) {
         this.props.getEhrAccessCode(auth.uid);
         this.setState({ accesscodeFetched: true });
      } else if (
         ehr &&
         ehr.accesscode &&
         !ehr.bearerToken &&
         !bearerTokenFetched
      ) {
         this.props.getEhrBearerToken(auth.uid, ehr.accesscode);
         this.setState({ bearerTokenFetched: true });
      }
   }

   UNSAFE_componentWillMount(): void {
      this.props.isLoading(true);
      this.clearList();
   }

   search = () => {
      this.props.isLoading(true);
      let {ehr} = this.props;
      let {searchText} = this.state;
      this.props.providerSearch(searchText, ehr.bearerToken);
   };

   handleChange = (event: any) => {
      this.setState({ searchText: event.target.value });
   }

   handleClick = (item: EHR) => {
      const { ehr } = this.props;
      const { bearerToken } = ehr;
      this.props.setTargetEHR(item);
      let getEnvVar = firebase.functions().httpsCallable("getEnvVar");
      let data = {
         key: "one_up_client_id",
      };
      let context = {};
      getEnvVar(data, context)
         .then((res: any) => {
            const redirectURL = `https://api.1up.health/connect/system/clinical/${item.id}?client_id=${res.data.one_up_client_id.value}&access_token=${bearerToken}`;
            window.location.replace(redirectURL);
         })
         .catch((err: any) => {
            console.error(err);
         });
   };

   clearList = () => {
      this.props.clearSearch();
   };

   render() {
      const { loading, ehr } = this.props;
      const { searchResult } = ehr;
      const loadingIndicator = loading ? <Loading /> : null;
      const { searchText } = this.state;

      return (
         <IonPage>
            {loadingIndicator}
            <AppHeader showHeader={true} text={"Query Health Records"} />
            <IonContent>
                  <form 
                     onSubmit={(e: any) => {
                        e.preventDefault();
                        this.search();
                     }}
                  >
                     <IonSearchbar className="ehr-search-bar"
                        value={searchText}
                        inputMode={"search"}
                        onIonClear={this.clearList}
                        onIonChange={this.handleChange}
                     />
                     
                     <IonButton className="ehr-search-bar"
                        type="submit"
                        expand="block"
                     >
                        Search
                     </IonButton>
                  </form>
            
               <IonList>
                  {searchResult &&
                     searchResult.length > 0 &&
                     searchResult.map((item: EHR) => {
                        return (
                           <IonItem
                              key={item.id}
                              onClick={() => this.handleClick(item)}
                              detail={true}
                              lines="none"
                           >
                              <IonLabel>
                                 <div className="ion-text-wrap">
                                    <img
                                       src={item.logo}
                                       style={{
                                          float: "left",
                                          marginRight: "10px",
                                       }}
                                       alt="Provider logo"
                                       width="64px"
                                       height="64px"
                                    />
                                    <h2 className="ion-float-left">
                                       {item.name}{" "}
                                    </h2>
                                 </div>
                              </IonLabel>
                           </IonItem>
                        );
                     })}
                  {(isEmptyObject(searchResult) ||
                     searchResult.length === 0) && (
                     <>
                        <p className="ion-padding">
                           Use the search bar to find for your health provider.
                           When you locate the correct entry, clicking on the
                           row will route to your provider's EHR portal
                        </p>
                        <p className="ion-padding">
                           You will need to know your login credentials for the
                           provider EHR portal to link your EHR records. If you
                           do not have login credentials for your provider's EHR
                           system, please contact your provider for further
                           instructions on how to login to their system.
                        </p>
                        <p className="ion-padding">
                           Once you authenticate and authorize the EHR portal to
                           share your EHR records, you will be routed back here
                           and prompted to health records.
                        </p>
                     </>
                  )}
               </IonList>
            </IonContent>
         </IonPage>
      );
   }
}

export default StartEHRLinkProcess;
