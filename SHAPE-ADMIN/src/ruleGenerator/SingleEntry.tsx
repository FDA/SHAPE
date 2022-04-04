import React from 'react';

import {
    IonInput,
    IonItem,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonCard
} from '@ionic/react';
import {trash} from 'ionicons/icons';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import {
    QuestionnaireQuestion,
    QuestionChoice,
    QuestionRule
} from '../interfaces/DataTypes';
import {questionTypes, dateFormats} from '../utils/Constants';

const FACTS: any = {
    currentValue: 'currentValue',
    gender: 'profile.gender',
    age: 'profile.age'
};

interface SkipToDropdownProps {
    questionList: Array<QuestionnaireQuestion>;
    skipTo: string;
    setSkipTo: Function;
    questionId: string;
}

export const SkipToDropdown = (props: SkipToDropdownProps) => {
    let {questionList, skipTo, setSkipTo, questionId} = props;

    let choices = questionList.filter(
        (q: QuestionnaireQuestion) => q.name !== questionId
    );

    return (
        <IonItem>
            <FormControl
                style={{
                    width: '100px'
                }}>
                <InputLabel>Skip To</InputLabel>
                <Select
                    value={skipTo}
                    onChange={(e: any) => setSkipTo(e.target.value)}>
                    {(function getSelect() {
                        return choices.map((q: QuestionnaireQuestion) => {
                            return (
                                <MenuItem
                                    key={`skipto-${q.name}`}
                                    value={q.name}>
                                    {q.title}
                                </MenuItem>
                            );
                        });
                    })()}
                </Select>
            </FormControl>
        </IonItem>
    );
};

interface OperatorDropdownProps {
    operator: string;
    setExpression: Function;
    index: number;
    questionType: string;
    fact: string;
}

export const OperatorDropdown = (props: OperatorDropdownProps) => {
    let {operator, setExpression, index, questionType, fact} = props;
    let operators = [
        {value: 'greaterThan', symbol: '>'},
        {value: 'lessThan', symbol: '<'},
        {value: 'equals', symbol: '='},
        {value: 'greaterThanOrEquals', symbol: '>='},
        {value: 'lessThanOrEquals', symbol: '<='}
    ];
    if (questionType === questionTypes.CHECKBOXGROUP) {
        operators = [
            {value: 'greaterThan', symbol: '>'},
            {value: 'lessThan', symbol: '<'},
            {value: 'contains', symbol: '='},
            {value: 'greaterThanOrEquals', symbol: '>='},
            {value: 'lessThanOrEquals', symbol: '<='}
        ];
    }
    if (
        (questionType === questionTypes.SINGLETEXT ||
            questionType === questionTypes.TEXTAREA) &&
        fact !== FACTS.age
    ) {
        operators = [{value: 'equals', symbol: '='}];
    }

    return (
        <IonItem>
            <FormControl
                style={{
                    width: '100px'
                }}>
                <InputLabel id="operator-helper-label">Operator</InputLabel>
                <Select
                    labelId="operator-helper-label"
                    id="operator-helper"
                    value={operator}
                    onChange={(e: any) =>
                        setExpression(e, index, questionType)
                    }>
                    {operators.map((o: {value: string; symbol: string}) => {
                        return (
                            <MenuItem key={o.value} value={o.value}>
                                {o.symbol}
                            </MenuItem>
                        );
                    })}
                </Select>
            </FormControl>
        </IonItem>
    );
};

interface ChoicesInputProps {
    choices: Array<QuestionChoice>;
    answer: string;
    setAnswer: Function;
    setNumericalAnswer: Function;
    index: number;
    fact: string;
    questionType: string;
    currentQuestion: QuestionnaireQuestion;
}

export const ChoicesInput = (props: ChoicesInputProps) => {
    let {
        choices,
        answer,
        setAnswer,
        setNumericalAnswer,
        index,
        fact,
        questionType,
        currentQuestion
    } = props;
    let choiceList = choices ? choices : [];
    let noDropdownTypes = [
        questionTypes.SINGLETEXT,
        questionTypes.TEXTAREA,
        questionTypes.SLIDER,
        questionTypes.RANGE,
        questionTypes.DATETIME
    ];

    let getChoicesDropdown = true;
    if (noDropdownTypes.includes(questionType)) {
        getChoicesDropdown = false;
    }

    if (fact === FACTS.age) {
        choiceList = [];
        for (var i = 1; i <= 100; i++) {
            choiceList.push({order: 0, text: `${i}`, value: `${i}`});
        }
        getChoicesDropdown = true;
    }
    if (fact === FACTS.gender) {
        choiceList = [
            {
                order: 0,
                text: 'M',
                value: 'M'
            },
            {
                order: 1,
                text: 'F',
                value: 'F'
            }
        ];
        getChoicesDropdown = true;
    }
    if (getChoicesDropdown) {
        return (
            <FormControl
                style={{
                    width: '100px'
                }}>
                <InputLabel id="select-helper-label">Choices</InputLabel>
                <Select
                    value={answer}
                    onChange={(e: any) => setAnswer(e, index)}>
                    {(function getSelect(selectChoices) {
                        return selectChoices.map((c: any) => {
                            return (
                                <MenuItem
                                    key={`choice-${c.value}`}
                                    value={c.value}>
                                    {c.value}
                                </MenuItem>
                            );
                        });
                    })(choiceList)}
                </Select>
            </FormControl>
        );
    } else if (questionType === questionTypes.DATETIME) {
        let type =
            currentQuestion.format === dateFormats.MMMDDYYYY
                ? 'datetime-local'
                : 'date';

        return (
            <input
                type={type}
                id="answer-time"
                name="answer-time"
                value={answer}
                onChange={(e: any) => setAnswer(e, index)}
            />
        );
    } else if (
        questionType === questionTypes.SINGLETEXT ||
        questionType === questionTypes.TEXTAREA
    ) {
        return (
            <IonInput
                value={answer}
                type="text"
                onIonChange={(e: any) => setAnswer(e, index)}
            />
        );
    } else if (questionType === questionTypes.SLIDER) {
        return (
            <IonInput
                value={answer}
                type="number"
                onIonChange={(e: any) => setNumericalAnswer(e, index)}
            />
        );
    } else if (questionType === questionTypes.RANGE) {
        return (
            <IonInput
                value={answer}
                type="number"
                onIonChange={(e: any) => setAnswer(e, index)}
            />
        );
    } else {
        return <div />;
    }
};

interface SingleEntryProps {
    setFact: Function;
    setExpression: Function;
    setAnswer: Function;
    setNumericalAnswer: Function;
    setSkipTo: Function;
    deleteEntry: Function;
    choices: any;
    questionId: string;
    ruleJson: any;
    questionList: any;
    index: number;
    questionType: string;
}

export const SingleEntry = (props: SingleEntryProps) => {
    let {
        choices,
        questionId,
        ruleJson,
        setFact,
        setExpression,
        setAnswer,
        setNumericalAnswer,
        questionList,
        index,
        deleteEntry,
        questionType
    } = props;
    let {expression} = ruleJson;
    let {operator, value, fact} = expression.entries[index];
    let currentQuestion = questionList.find(
        (q: QuestionnaireQuestion) => q.name === questionId
    );

    return (
        <IonCard>
            <IonGrid>
                <IonRow>
                    <IonCol size="10">{`Entry: ${index}`}</IonCol>
                    <IonCol size="2">
                        <IonIcon
                            icon={trash}
                            style={{
                                paddingTop: '.5em',
                                cursor: 'pointer',
                                fontSize: '20px'
                            }}
                            onClick={() => deleteEntry(ruleJson, index)}
                        />
                    </IonCol>
                </IonRow>
                <IonRow>
                    <IonCol size="6" class={'ruleCol'}>
                        <IonItem>
                            <FormControl>
                                <InputLabel id="select-helper-label">
                                    Fact
                                </InputLabel>
                                <Select
                                    labelId="demo-simple-select-helper-label"
                                    id="demo-simple-select-helper"
                                    value={fact}
                                    onChange={(e: any) => setFact(e, index)}>
                                    {(function getFactsDropdown(facts) {
                                        let res: any = [];
                                        let keys = Object.keys(facts);
                                        for (let i in keys) {
                                            let key: any = keys[i];
                                            let temp = (
                                                <MenuItem
                                                    key={key}
                                                    value={facts[key]}>
                                                    {key}
                                                </MenuItem>
                                            );
                                            res.push(temp);
                                        }
                                        return res;
                                    })(FACTS)}
                                </Select>
                            </FormControl>
                        </IonItem>
                    </IonCol>
                    <IonCol size="6" class={'ruleCol'}>
                        <OperatorDropdown
                            fact={fact}
                            operator={operator}
                            setExpression={setExpression}
                            index={index}
                            questionType={questionType}
                        />
                    </IonCol>
                </IonRow>
                <IonRow>
                    <IonCol size="12" class={'ruleCol'}>
                        <IonItem>
                            <ChoicesInput
                                questionType={questionType}
                                choices={choices}
                                answer={value}
                                setNumericalAnswer={setNumericalAnswer}
                                setAnswer={setAnswer}
                                index={index}
                                fact={fact}
                                currentQuestion={currentQuestion}
                            />
                        </IonItem>
                    </IonCol>
                </IonRow>
            </IonGrid>
        </IonCard>
    );
};

interface SingleEntryDisplayProps {
    ruleJson: QuestionRule;
    index: number;
    getSymbol: Function;
}

export const SingleEntryDisplay = (props: SingleEntryDisplayProps) => {
    let {ruleJson, index, getSymbol} = props;

    let {expression} = ruleJson;
    let {operator, value, fact} = expression.entries[index];
    return (
        <IonGrid>
            <IonRow>
                <IonCol size="2">{`Entry: ${index}`}</IonCol>
                <IonCol size="3">{`Fact: ${fact}`}</IonCol>
                <IonCol size="3">
                    {`Operator: ${operator} (${getSymbol(operator)})`}
                </IonCol>
                <IonCol size="4">{`Matching Value: ${value}`}</IonCol>
            </IonRow>
        </IonGrid>
    );
};
