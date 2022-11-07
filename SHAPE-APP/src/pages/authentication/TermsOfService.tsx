import React, { Component, createRef } from 'react';
import { IonButton, IonContent, IonFooter, IonPage, IonText, IonToolbar, IonAlert } from '@ionic/react';
import AppHeader from '../layout/AppHeader';
import { DefaultTSContent } from './TSContent/DefaultTSContent';
import { routes } from '../../utils/Constants';
import { connect } from 'react-redux';
import { FirebaseAuth, Participant } from '../../interfaces/DataTypes';
import { joinPublicSurvey, toggleJoinSuccess, joinOrg } from '../../redux/actions/Questionnaire';
import { refreshAll } from '../../redux/actions/Participant';
import Loading from '../layout/Loading';
import { RouteComponentProps, withRouter } from 'react-router';

interface PassedProps extends RouteComponentProps {
    fireBaseAuth: FirebaseAuth;
    selectedOrg: string;
    joinPublicSurveyDispatch: Function;
    joinPrivateOrgDispatch: Function;
    isLoading: boolean;
    joinSuccess: boolean;
    toggleJoinSuccessDispatch: Function;
    participant: Participant;
    refreshAllDispatch: Function;
}

interface TermsOfServiceState {
    buttonEnabled: boolean;
}

class TermsOfService extends Component<PassedProps, TermsOfServiceState> {
    scrollContainer: any = createRef();
    constructor(props: PassedProps) {
        super(props);
        this.state = { buttonEnabled: false };
    }

    componentDidMount() {
        setTimeout(this.checkScrollFinished, 3000, { target: this.scrollContainer.current });
    }

    enableButton = () => {
        const { buttonEnabled } = this.state;
        if (!buttonEnabled) {
            this.setState({ buttonEnabled: true });
        }
    };

    checkScrollFinished = (event: any) => {
        if (event.target) {
            event.target.getScrollElement().then((scrollElement: HTMLElement) => {
                const scrollMax = scrollElement.scrollHeight;
                const scrollDist = scrollElement.scrollTop;
                const clientHeight = scrollElement.clientHeight;
                if (scrollMax - scrollDist - clientHeight <= 5) {
                    this.enableButton();
                }
            });
        }
    };
    join = () => {
        const { joinPublicSurveyDispatch, joinPrivateOrgDispatch } = this.props;
        //@ts-ignore
        const { status } = this.props.match.params;
        if (status === 'public') {
            joinPublicSurveyDispatch();
        } else if (status === 'private') {
            joinPrivateOrgDispatch();
        } else {
            console.error('valid option not selected');
        }
    };

    tsContent = () => {
        //TODO: Add for each org that joins the app
        return <DefaultTSContent />;
    };

    render() {
        const { buttonEnabled } = this.state;
        const { fireBaseAuth, isLoading, joinSuccess, toggleJoinSuccessDispatch, refreshAllDispatch } =
            this.props;
        return (
            <IonPage>
                {isLoading && <Loading />}
                <AppHeader showHeader={true} text={'Terms of Service'} />
                <IonContent
                    ref={this.scrollContainer}
                    className='ion-padding'
                    scrollEvents={true}
                    onIonScrollEnd={this.checkScrollFinished}>
                    <IonText className='ion-text-center'>
                        <h1>SHAPE App Terms of Service</h1>
                    </IonText>
                    <div>{this.tsContent()}</div>
                </IonContent>
                <IonFooter>
                    <IonToolbar className='ion-no-border'>
                        {fireBaseAuth.isEmpty && (
                            <IonButton
                                routerLink={routes.ADD_PARTICIPANTS_QUERY}
                                style={{ marginTop: '.5em' }}
                                expand='block'
                                fill='solid'
                                type='button'
                                disabled={!buttonEnabled}
                                color='primary'>
                                I agree, Continue.
                            </IonButton>
                        )}
                        {!fireBaseAuth.isEmpty && (
                            <IonButton
                                onClick={() => this.join()}
                                style={{ marginTop: '.5em' }}
                                expand='block'
                                fill='solid'
                                type='button'
                                disabled={!buttonEnabled}
                                color='primary'>
                                I agree, Continue.
                            </IonButton>
                        )}
                    </IonToolbar>
                </IonFooter>
                <IonAlert
                    aria-label={'success message'}
                    isOpen={joinSuccess}
                    header={'Success'}
                    message={`Thank you for joining!`}
                    buttons={[
                        {
                            text: 'Return Home',
                            handler: () => {
                                toggleJoinSuccessDispatch(false);
                                refreshAllDispatch();
                                this.props.history.replace(routes.TAB1);
                            }
                        }
                    ]}
                />
            </IonPage>
        );
    }
}

const mapStateToProps = (state: any) => ({
    fireBaseAuth: state.firebase.auth,
    selectedOrg: state.selectedOrg,
    isLoading: state.loading,
    joinSuccess: state.joinSuccess,
    participant: state.participant
});

export const mapDispatchToProps = (dispatch: any) => {
    return {
        joinPublicSurveyDispatch() {
            dispatch(joinPublicSurvey());
        },
        joinPrivateOrgDispatch() {
            dispatch(joinOrg());
        },
        toggleJoinSuccessDispatch(bool: boolean) {
            dispatch(toggleJoinSuccess(bool));
        },
        refreshAllDispatch() {
            dispatch(refreshAll());
        }
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TermsOfService));
