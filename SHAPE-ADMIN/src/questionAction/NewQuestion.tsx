import {
    IonCol,
    IonGrid,
    IonHeader,
    IonIcon,
    IonItem,
    IonList,
    IonRow,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import React from 'react';
import { questionTypes, routes } from '../utils/Constants';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import SingleText from '../questionType/SingleText';
import RadioGroup from '../questionType/RadioGroup';
import DateTime from '../questionType/DateTime';
import CheckboxGroup from '../questionType/CheckboxGroup';
import Dropdown from '../questionType/Dropdown';
import Slider from '../questionType/Slider';
import TextArea from '../questionType/TextArea';
import Range from '../questionType/Range';
import InfoCard from '../questionType/InfoCard';
import { connect } from 'react-redux';
import {
    analyticsOutline,
    arrowDownOutline,
    calendarSharp,
    checkboxOutline,
    documentTextOutline,
    optionsOutline,
    radioButtonOnOutline,
    textOutline,
    informationCircleOutline
} from 'ionicons/icons';

interface State {
    failure: boolean;
    view: string;
}

interface ReduxProps extends RouteComponentProps {
    loggedIn: boolean;
}

class NewQuestion extends React.Component<ReduxProps, State> {
    constructor(props: ReduxProps) {
        super(props);
        this.state = {
            failure: false,
            view: questionTypes.SINGLETEXT
        };
    }

    componentDidMount() {
        const { loggedIn } = this.props;

        if (!loggedIn) {
            this.props.history.push(routes.LOGIN);
        }
    }

    handleMenuChange(menuItem: string) {
        this.setState({ view: menuItem });
    }

    calculateColor(type: string) {
        return this.state.view === type ? 'light' : 'none';
    }

    render() {
        let { view } = this.state;

        return (
            <>
                <IonHeader aria-label='Create New'>
                    <IonToolbar>
                        <IonTitle>Create New</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonGrid>
                    <IonRow>
                        <IonCol size='sm'>
                            <IonList>
                                <IonItem
                                    button
                                    className='questionType'
                                    onClick={() => this.handleMenuChange(questionTypes.SINGLETEXT)}
                                    lines='none'
                                    color={this.calculateColor(questionTypes.SINGLETEXT)}>
                                    Single Line Text &nbsp;
                                    <IonIcon icon={textOutline} />
                                </IonItem>
                                <IonItem
                                    button
                                    className='questionType'
                                    onClick={() => this.handleMenuChange(questionTypes.RADIOGROUP)}
                                    lines='none'
                                    color={this.calculateColor(questionTypes.RADIOGROUP)}>
                                    Radio Group &nbsp;
                                    <IonIcon icon={radioButtonOnOutline} />
                                </IonItem>
                                <IonItem
                                    button
                                    className='questionType'
                                    onClick={() => this.handleMenuChange(questionTypes.DATETIME)}
                                    lines='none'
                                    color={this.calculateColor(questionTypes.DATETIME)}>
                                    Date Time &nbsp;
                                    <IonIcon icon={calendarSharp} />
                                </IonItem>
                                <IonItem
                                    button
                                    className='questionType'
                                    onClick={() => this.handleMenuChange(questionTypes.CHECKBOXGROUP)}
                                    lines='none'
                                    color={this.calculateColor(questionTypes.CHECKBOXGROUP)}>
                                    Checkbox &nbsp;
                                    <IonIcon icon={checkboxOutline} />
                                </IonItem>
                                <IonItem
                                    button
                                    className='questionType'
                                    onClick={() => this.handleMenuChange(questionTypes.SELECT)}
                                    lines='none'
                                    color={this.calculateColor(questionTypes.SELECT)}>
                                    Select &nbsp;
                                    <IonIcon icon={arrowDownOutline} />
                                </IonItem>
                                <IonItem
                                    button
                                    className='questionType'
                                    onClick={() => this.handleMenuChange(questionTypes.SLIDER)}
                                    lines='none'
                                    color={this.calculateColor(questionTypes.SLIDER)}>
                                    Slider &nbsp;
                                    <IonIcon icon={optionsOutline} />
                                </IonItem>
                                <IonItem
                                    button
                                    className='questionType'
                                    onClick={() => this.handleMenuChange(questionTypes.TEXTAREA)}
                                    lines='none'
                                    color={this.calculateColor(questionTypes.TEXTAREA)}>
                                    Text Area &nbsp;
                                    <IonIcon icon={documentTextOutline} />
                                </IonItem>
                                <IonItem
                                    button
                                    className='questionType'
                                    onClick={() => this.handleMenuChange(questionTypes.RANGE)}
                                    lines='none'
                                    color={this.calculateColor(questionTypes.RANGE)}>
                                    Range &nbsp;
                                    <IonIcon icon={analyticsOutline} />
                                </IonItem>
                                <IonItem
                                    button
                                    className='questionType'
                                    onClick={() => this.handleMenuChange(questionTypes.INFO)}
                                    lines='none'
                                    color={this.calculateColor(questionTypes.INFO)}>
                                    Info &nbsp;
                                    <IonIcon icon={informationCircleOutline} />
                                </IonItem>
                            </IonList>
                        </IonCol>
                        <IonCol>
                            {view === questionTypes.SINGLETEXT && <SingleText />}
                            {view === questionTypes.RADIOGROUP && <RadioGroup />}
                            {view === questionTypes.DATETIME && <DateTime />}
                            {view === questionTypes.CHECKBOXGROUP && <CheckboxGroup />}
                            {view === questionTypes.SELECT && <Dropdown />}
                            {view === questionTypes.SLIDER && <Slider />}
                            {view === questionTypes.TEXTAREA && <TextArea />}
                            {view === questionTypes.RANGE && <Range />}
                            {view === questionTypes.INFO && <InfoCard />}
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </>
        );
    }
}

const mapStateToProps = (state: any) => ({
    loggedIn: state.authentication.loggedIn
});

export default connect(mapStateToProps)(withRouter(NewQuestion));
