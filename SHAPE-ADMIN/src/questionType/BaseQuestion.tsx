import { IonButton, IonInput, IonItem, IonLabel, IonList, IonText } from '@ionic/react';
import React from 'react';
import { guid, isEmptyObject } from '../utils/Utils';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { QuestionnaireQuestion, Questionnaire, QuestionChoice } from '../interfaces/DataTypes';
import { createQuestionTemplate } from '../utils/API';
import { routes, questionTypes, FORMATS } from '../utils/Constants';
import { updateQuestionnaire } from '../redux/actions/Questionnaire';
import { connect } from 'react-redux';
import RequiredField from './RequiredField';
import { ItemReorderEventDetail } from '@ionic/core';
import BaseQuestionFactory from './BaseQuestionFactory';
const arrayMove = require('array-move');

export interface State {
    variable: string;
    failure: boolean;
    title: string;
    text: string;
    placeholder: string; //Text only
    required?: boolean;
    requiredMessage?: string;
    choices: Array<QuestionChoice>; //Select only
    displayChoices: any; //Select only
    format: string; //DateTime only
    min: string; //Range and Slider only
    max: string; //Range and Slider only
    step: string; //Slider only
    pin: boolean; //Slider only
    ticks: boolean; //Slider only
    sliderValue: number; //Slider only
}

interface ReduxProps extends RouteComponentProps {
    questionnaire: Questionnaire;
    updateQuestionnaireDispatch: Function;
    type: string;
    loggedIn: boolean;
}

class BaseQuestion extends React.Component<ReduxProps, State> {
    constructor(props: ReduxProps) {
        super(props);
        this.state = {
            failure: false,
            variable: '',
            title: '',
            text: '',
            placeholder: '',
            required: false,
            requiredMessage: '',
            displayChoices: <div />,
            choices: [],
            format: FORMATS[0]['formatStr'],
            min: '0',
            max: '10',
            step: '1',
            pin: true,
            ticks: true,
            sliderValue: 0
        };
    }

    componentDidMount() {
        const { loggedIn } = this.props;

        if (!loggedIn) {
            this.props.history.push(routes.LOGIN);
        }
    }

    handleRequiredChange = (e: any) => {
        const { checked } = e.target;
        this.setState({ required: checked });
    };

    handleTitleChange = (e: any) => {
        this.setState({ title: e.target.value });
    };

    handleVariableChange = (e: any) => {
        this.setState({ variable: e.target.value });
    };

    handleTextChange = (e: any) => {
        this.setState({ text: e.target.value });
    };

    handleRequiredMessage = (e: any) => {
        this.setState({ requiredMessage: e.target.value });
    };

    handlePlaceholderChange = (e: any) => {
        this.setState({ placeholder: e.target.value });
    };

    addChoice = () => {
        this.setState({ displayChoices: <div /> });
        let { choices } = this.state;
        choices.push({
            value: '',
            text: '',
            index: guid(),
            order: choices.length
        });
        this.setState({ choices: choices });
    };

    doReorder = (event: CustomEvent<ItemReorderEventDetail>) => {
        event.stopPropagation();
        let choices = this.state.choices;
        choices = arrayMove(choices, event.detail.from, event.detail.to);
        choices.forEach((choice: QuestionChoice, index: number) => {
            choice.order = index;
        });
        this.setState({ choices: choices });
        event.detail.complete();
    };

    deleteChoice = (index: number) => {
        let tempArray = this.state.choices;
        tempArray.splice(index, 1);
        tempArray.forEach((choice: QuestionChoice, choiceIndex: number) => {
            choice.order = choiceIndex;
        });
        this.setState({ choices: tempArray });
    };

    handleChoiceValueChange = (e: any, index: number) => {
        let tempArray = this.state.choices;
        tempArray[index].value = e.target.value;
        this.setState({ choices: tempArray });
    };

    handleChoiceTextChange = (e: any, index: number) => {
        let tempArray = this.state.choices;
        tempArray[index].text = e.target.value;
        this.setState({ choices: tempArray });
    };

    setFormat = (format: string) => {
        this.setState({
            format: format
        });
    };

    handleMinChange = (e: any) => {
        this.setState({ min: e.target.value });
    };

    handleMaxChange = (e: any) => {
        this.setState({ max: e.target.value });
    };

    handleInputChange = (e: any) => {
        let key = e.target.name;
        if (key === 'step' && e.target.value === 0) return;
        if (Object.keys(this.state).includes(key)) {
            this.setState({
                [key]: e.target.value
            } as Pick<State, keyof State>);
        }
    };

    validate = () => {
        let { type } = this.props;
        let {
            variable,
            title,
            text,
            placeholder,
            required,
            requiredMessage,
            choices,
            format,
            min,
            max,
            step,
            pin,
            ticks
        } = this.state;

        switch (type) {
            case questionTypes.CHECKBOXGROUP:
            case questionTypes.SELECT:
            case questionTypes.RADIOGROUP:
                let cList = choices.filter((choice: QuestionChoice) => {
                    return isEmptyObject(choice.value) || isEmptyObject(choice.text);
                });
                let choicesMissingValue = cList.length > 0;
                if (
                    !isEmptyObject(variable) &&
                    !isEmptyObject(title) &&
                    !isEmptyObject(text) &&
                    !choicesMissingValue
                )
                    return {
                        variable: variable,
                        title: title,
                        text: text,
                        type: type,
                        choices: choices,
                        required: required,
                        requiredMessage: requiredMessage
                    };
                break;
            case questionTypes.SINGLETEXT:
            case questionTypes.TEXTAREA:
                if (!isEmptyObject(variable) && !isEmptyObject(title) && !isEmptyObject(text))
                    return {
                        variable: variable,
                        text: text,
                        title: title,
                        placeholder: placeholder,
                        type: type,
                        required: required,
                        requiredMessage: requiredMessage
                    };
                break;
            case questionTypes.DATETIME:
                if (!isEmptyObject(variable) && !isEmptyObject(title) && !isEmptyObject(text)) {
                    return {
                        variable: variable,
                        title: title,
                        text: text,
                        type: questionTypes.DATETIME,
                        format: format,
                        required: required,
                        requiredMessage: requiredMessage
                    };
                }
                break;
            case questionTypes.RANGE:
                if (!isEmptyObject(variable) && !isEmptyObject(title) && !isEmptyObject(text)) {
                    return {
                        variable: variable,
                        text: text,
                        title: title,
                        type: questionTypes.RANGE,
                        min: min,
                        max: max,
                        required: required,
                        requiredMessage: requiredMessage
                    };
                }
                break;
            case questionTypes.SLIDER:
                if (!isEmptyObject(variable) && !isEmptyObject(title) && !isEmptyObject(text)) {
                    return {
                        variable: variable,
                        title: title,
                        text: text,
                        type: 'slider',
                        options: {
                            min,
                            max,
                            step,
                            pin,
                            ticks
                        },
                        required: required,
                        requiredMessage: requiredMessage
                    };
                }
                break;
            default:
                return null;
        }
        return null;
    };

    submit = () => {
        let question = this.validate();

        if (!isEmptyObject(question)) {
            createQuestionTemplate(question)
                .then(() => {
                    this.setState({
                        failure: false,
                        variable: '',
                        title: '',
                        text: '',
                        placeholder: '',
                        required: false,
                        requiredMessage: '',
                        displayChoices: <div />,
                        choices: [],
                        format: FORMATS[0]['formatStr'],
                        min: '0',
                        max: '10',
                        pin: true,
                        sliderValue: 0,
                        step: '1'
                    });
                })
                .catch((err: any) => {
                    console.error(err);
                });
        } else {
            this.setState({ failure: true });
        }
    };

    submitAndAdd = () => {
        let { questionnaire } = this.props;
        let questionnaireId = questionnaire.id;

        let question = this.validate();

        if (!isEmptyObject(question)) {
            createQuestionTemplate(question)
                .then(() => {
                    let tempQuestionnaire = questionnaire;
                    if (isEmptyObject(tempQuestionnaire.questions)) {
                        tempQuestionnaire.questions = [];
                    }
                    let questionnaireQuestion: QuestionnaireQuestion = {
                        ...question,
                        order: tempQuestionnaire.questions.length,
                        name: guid()
                    };
                    tempQuestionnaire.questions.push(questionnaireQuestion);
                    this.props.updateQuestionnaireDispatch(questionnaireId, tempQuestionnaire);
                    this.props.history.goBack();
                })
                .catch((err: any) => {
                    console.error(err);
                });
        } else {
            this.setState({ failure: true });
        }
    };

    render() {
        let {
            variable,
            title,
            text,
            placeholder,
            required,
            requiredMessage,
            choices,
            displayChoices,
            format,
            min,
            max,
            step,
            pin,
            sliderValue,
            ticks
        } = this.state;
        let { type } = this.props;

        return (
            <>
                <form>
                    <IonList lines='full' class='ion-no-margin ion-no-padding'>
                        <IonItem>
                            <IonLabel position='stacked'>
                                Variable<IonText color='danger'>*</IonText>
                            </IonLabel>
                            <IonInput
                                placeholder='A unique ID'
                                id='question-variable'
                                value={variable}
                                onIonChange={(e) => this.handleVariableChange(e)}></IonInput>
                        </IonItem>
                        <IonItem>
                            <IonLabel position='stacked'>
                                Question<IonText color='danger'>*</IonText>
                            </IonLabel>
                            <IonInput
                                placeholder='Question text'
                                id='question-title'
                                value={title}
                                onIonChange={(e) => this.handleTitleChange(e)}></IonInput>
                        </IonItem>
                        <IonItem>
                            <IonLabel position='stacked'>
                                Instructions<IonText color='danger'>*</IonText>
                            </IonLabel>
                            <IonInput
                                placeholder='Additional instructions for the user to consider'
                                id='question-text'
                                value={text}
                                onIonChange={(e) => this.handleTextChange(e)}></IonInput>
                        </IonItem>
                        <RequiredField
                            checked={required}
                            message={requiredMessage}
                            changeEventHandler={this.handleRequiredChange}
                            messageEventHandler={this.handleRequiredMessage}
                        />
                        <BaseQuestionFactory
                            type={type}
                            choices={choices}
                            displayChoices={displayChoices}
                            format={format}
                            placeholder={placeholder}
                            min={min}
                            max={max}
                            addChoice={this.addChoice}
                            doReorder={this.doReorder}
                            handleChoiceValueChange={this.handleChoiceValueChange}
                            handleChoiceTextChange={this.handleChoiceTextChange}
                            deleteChoice={this.deleteChoice}
                            setFormat={this.setFormat}
                            handlePlaceholderChange={this.handlePlaceholderChange}
                            handleMinChange={this.handleMinChange}
                            handleMaxChange={this.handleMaxChange}
                            step={step}
                            pin={pin}
                            ticks={ticks}
                            sliderValue={sliderValue}
                            handleInputChange={this.handleInputChange}
                        />
                    </IonList>
                    <IonButton size='small' fill='outline' onClick={this.submit}>
                        Create
                    </IonButton>
                    <IonButton size='small' fill='outline' color='secondary' onClick={this.submitAndAdd}>
                        Create and add to this Questionnaire
                    </IonButton>
                    {this.state.failure && (
                        <IonText color='danger'>All required fields are not filled.</IonText>
                    )}
                </form>
            </>
        );
    }
}

function mapStateToProps(state: any) {
    return {
        questionnaire: state.questionnaire,
        loggedIn: state.authentication.loggedIn
    };
}

function mapDispatchToProps(dispatch: any) {
    return {
        updateQuestionnaireDispatch(questionnaireId: string, questionnaire: Questionnaire) {
            dispatch(updateQuestionnaire(questionnaireId, questionnaire));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(BaseQuestion));
