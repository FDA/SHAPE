import React, {Component} from 'react';
import {
    IonItem,
    IonLabel,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonCard,
    IonButton
} from '@ionic/react';
import {trash, addCircle} from 'ionicons/icons';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import './RuleGenerator.css';
import {SingleEntry, SkipToDropdown, SingleEntryDisplay} from './SingleEntry';
import {QuestionRule, QuestionnaireQuestion} from '../interfaces/DataTypes';

interface RuleProps {
    ruleJson: QuestionRule;
    deleteRule: Function;
    deleteEntry: Function;
    updateRule: Function;
    selectEditRule: Function;
    saveRule: Function;
    dialogMode: boolean;
    editing?: boolean;
    questionId?: string;
    questionList: Array<QuestionnaireQuestion>;
    questionType: string;
}
interface RuleState {
    ruleType: string;
}

class Rule extends Component<RuleProps, RuleState> {
    constructor(props: RuleProps) {
        super(props);
        this.state = {
            ruleType: 'OR'
        };
    }

    setExpression = (e: any, index: number) => {
        let value = e.target.value;
        this.props.ruleJson.expression.entries[index].operator = value;
        this.props.updateRule(this.props.ruleJson);
    };

    setRuleType = (e: any) => {
        this.props.ruleJson.ruleType = e.target.value;
        this.props.updateRule(this.props.ruleJson);
    };

    setAnswer = (e: any, index: number) => {
        this.props.ruleJson.expression.entries[index].value = e.target.value;
        this.props.updateRule(this.props.ruleJson);
    };

    setNumericalAnswer = (e: any, index: number) => {
        this.props.ruleJson.expression.entries[index].value = parseInt(
            e.target.value
        );
        this.props.updateRule(this.props.ruleJson);
    };

    setSkipTo = (e: any) => {
        this.props.ruleJson.skipTo = e;
        this.props.updateRule(this.props.ruleJson);
    };

    setFact = (e: any, index: number) => {
        this.props.ruleJson.expression.entries[index].fact = e.target.value;
        this.props.updateRule(this.props.ruleJson);
    };

    addEntry = () => {
        let tempEntry = {
            fact: 'currentValue',
            operator: '',
            value: ''
        };
        this.props.ruleJson.expression.entries.push(tempEntry);
        this.props.updateRule(this.props.ruleJson);
    };

    getSymbol = (key: string) => {
        let dic: any = {
            greaterThan: '>',
            lessThan: '<',
            equals: '=',
            contains: '=',
            greaterThanOrEquals: '>=',
            lessThanOrEquals: '<='
        };
        return dic[key];
    };

    getQuestionChoices = (questionId: string) => {
        let matched = this.props.questionList.find(
            (e) => e.name === questionId
        );
        if (matched) {
            return matched.choices;
        }
        return null;
    };

    getTitleFromName = (name: string) => {
        let {questionList} = this.props;
        let found = questionList.find((q) => q.name === name);
        return found ? found.title : 'NOT FOUND';
    };

    getDialogDisplayRule = () => {
        const {ruleJson, questionId, questionList, questionType} = this.props;
        const choices = this.getQuestionChoices(questionId);
        const SingleEntryProps = {
            setFact: this.setFact,
            setExpression: this.setExpression,
            setAnswer: this.setAnswer,
            setNumericalAnswer: this.setNumericalAnswer,
            setSkipTo: this.setSkipTo,
            deleteEntry: this.props.deleteEntry,
            ruleJson,
            questionId,
            questionList,
            questionType,
            choices
        };

        if (ruleJson) {
            return (
                <div>
                    <IonGrid>
                        <IonRow>
                            <IonCol size="6">
                                <FormControl>
                                    <InputLabel>Rule Type</InputLabel>
                                    <Select
                                        value={this.props.ruleJson.ruleType}
                                        onChange={(e: any) =>
                                            this.setRuleType(e)
                                        }
                                        style={{
                                            width: '200px'
                                        }}>
                                        <MenuItem value="or">
                                            {' '}
                                            {'Or (|)'}{' '}
                                        </MenuItem>
                                        <MenuItem value="and">
                                            {' '}
                                            {'And (&)'}{' '}
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </IonCol>
                            <IonCol size="6">
                                <SkipToDropdown
                                    questionId={questionId}
                                    questionList={questionList}
                                    skipTo={this.props.ruleJson.skipTo}
                                    setSkipTo={this.setSkipTo}
                                />
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                    Add rule entry &nbsp;
                    <IonIcon
                        icon={addCircle}
                        style={{
                            marginTop: '10px',
                            fontSize: '20px',
                            cursor: 'pointer'
                        }}
                        onClick={() => this.addEntry()}
                    />
                    {ruleJson.expression.entries.map(function getEntries(
                        e: any,
                        i: number
                    ) {
                        return (
                            <SingleEntry
                                {...SingleEntryProps}
                                index={i}
                                key={`single-entry-${i}`}
                            />
                        );
                    })}
                </div>
            );
        } else {
            return <div>Loading...</div>;
        }
    };

    getDisplayRule = () => {
        let {ruleJson, questionId, questionList} = this.props;
        let {expression, skipTo, ruleType} = this.props.ruleJson;
        let {entries} = expression;
        let {editing} = this.props;
        const choices = this.getQuestionChoices(questionId);
        const SingleEntryProps = {
            setFact: this.setFact,
            setExpression: this.setExpression,
            setAnswer: this.setAnswer,
            setNumericalAnswer: this.setNumericalAnswer,
            setSkipTo: this.setSkipTo,
            deleteEntry: this.props.deleteEntry,
            getSymbol: this.getSymbol,
            ruleJson,
            questionId,
            questionList,
            choices
        };
        return (
            <IonCard>
                <IonGrid class={'ruleGrid'}>
                    <IonRow>
                        <IonCol size={editing ? '2' : '4'} class={'ruleCol'}>
                            <IonItem color="light">
                                <IonLabel>{`Type:  ${ruleType}`}</IonLabel>
                            </IonItem>
                        </IonCol>
                        <IonCol size="4" class={'ruleCol'}>
                            <IonItem color="light">
                                <IonLabel>{`Entries: ${entries.length}`}</IonLabel>
                            </IonItem>
                        </IonCol>
                        <IonCol size="4" class={'ruleCol'}>
                            <IonItem color="light">
                                <IonLabel>{`Skip To: ${this.getTitleFromName(
                                    skipTo
                                )}`}</IonLabel>
                            </IonItem>
                        </IonCol>
                        {editing && (
                            <IonCol class={'ruleCol'} size="2">
                                <IonItem color="light">
                                    <IonButton
                                        style={{
                                            paddingBottom: '.1em'
                                        }}
                                        onClick={() =>
                                            this.props.selectEditRule(this)
                                        }>
                                        Edit
                                    </IonButton>
                                    &nbsp; &nbsp; &nbsp;
                                    <IonIcon
                                        icon={trash}
                                        style={{
                                            cursor: 'pointer',
                                            fontSize: '25px'
                                        }}
                                        onClick={() =>
                                            this.props.deleteRule(this)
                                        }
                                    />
                                </IonItem>
                            </IonCol>
                        )}
                    </IonRow>
                    {ruleJson.expression.entries.map(function getEntries(
                        e: any,
                        i: number
                    ) {
                        return (
                            <SingleEntryDisplay
                                {...SingleEntryProps}
                                index={i}
                                key={`single-entry-${i}`}
                            />
                        );
                    })}
                </IonGrid>
            </IonCard>
        );
    };

    render() {
        let {dialogMode} = this.props;
        return (
            <div>
                {!dialogMode && this.getDisplayRule()}
                {dialogMode && this.getDialogDisplayRule()}
            </div>
        );
    }
}

export default Rule;
