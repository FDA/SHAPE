import React from 'react';
import { IonGrid, IonRow, IonCol, IonIcon, IonCard, IonCardContent, IonButton } from '@ionic/react';
import { trash } from 'ionicons/icons';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { QuestionnaireQuestion, QuestionChoice, QuestionRule, Questionnaire } from '../interfaces/DataTypes';
import { questionTypes, dateFormats } from '../utils/Constants';
import { Input } from '@material-ui/core';

const FACTS: any = {
    currentValue: 'currentValue',
    gender: 'profile.gender',
    age: 'profile.age'
};

interface AddToDropdownProps {
    questionnaireId: string;
    questionnaireList: Questionnaire[];
    addTo: string;
    setAddTo: Function;
}

export const AddToDropdown = (props: AddToDropdownProps) => {
    const { questionnaireId, questionnaireList, addTo, setAddTo } = props;
    return (
        <Select
            autoWidth
            className='ruleSelect'
            value={addTo ? addTo : ''}
            onChange={(e: any) => setAddTo(e.target.value)}>
            {questionnaireList
                .filter((q: Questionnaire) => q.id !== questionnaireId)
                .map((q: Questionnaire) => {
                    return (
                        <MenuItem key={`addTo-${q.id}`} value={q.id}>
                            {q.name}
                        </MenuItem>
                    );
                })}
        </Select>
    );
};
interface SkipToDropdownProps {
    questionList: Array<QuestionnaireQuestion>;
    skipTo: string;
    setSkipTo: Function;
    questionId: string;
}

export const SkipToDropdown = (props: SkipToDropdownProps) => {
    const { questionList, skipTo, setSkipTo, questionId } = props;
    return (
        <Select
            autoWidth
            className='ruleSelect'
            value={skipTo ? skipTo : ''}
            onChange={(e: any) => setSkipTo(e.target.value)}>
            {questionList
                .filter((q: QuestionnaireQuestion) => q.name !== questionId)
                .map((q: QuestionnaireQuestion) => {
                    return (
                        <MenuItem key={`skipTo-${q.name}`} value={q.name}>
                            {q.title}
                        </MenuItem>
                    );
                })}
        </Select>
    );
};

interface FactDropDownProps {
    index: any;
    currentValueOnly: boolean;
    fact: any;
    displayFact: Function;
    setFact: Function;
    facts: any;
}

export const FactDropdown = (props: FactDropDownProps) => {
    const { index, fact, setFact, currentValueOnly, displayFact } = props;
    let { facts } = props;
    if (currentValueOnly) facts = { currentValue: 'currentValue' };
    const keys = Object.keys(facts);

    return (
        <Select autoWidth className='ruleSelect' value={fact} onChange={(e: any) => setFact(e, index)}>
            {keys.map((f: any, i: number) => {
                return (
                    <MenuItem key={i} value={facts[f]}>
                        {displayFact(facts[f])}
                    </MenuItem>
                );
            })}
        </Select>
    );
};

interface OperatorDropdownProps {
    operator: string;
    setExpression: Function;
    index: number;
    questionType: string;
    fact: string;
    displayOperator: Function;
}

export const OperatorDropdown = (props: OperatorDropdownProps) => {
    const { operator, setExpression, index, questionType, fact, displayOperator } = props;
    const allOperators = [FACTS.age, questionTypes.DATETIME, questionTypes.RANGE, questionTypes.SLIDER];
    const onlyEquals = [FACTS.gender, questionTypes.RADIOGROUP, questionTypes.SELECT];
    const onlyContains = [questionTypes.SINGLETEXT, questionTypes.TEXTAREA];
    const containsAndEquals = [questionTypes.CHECKBOXGROUP];

    let operators = [{ value: 'equals', symbol: '==' }];

    if (onlyEquals.includes(fact)) {
        operators = [{ value: 'equals', symbol: '==' }];
    } else if (allOperators.includes(fact) || allOperators.includes(questionType)) {
        operators = [
            { value: 'greaterThan', symbol: '>' },
            { value: 'lessThan', symbol: '<' },
            { value: 'equals', symbol: '==' },
            { value: 'greaterThanOrEquals', symbol: '>=' },
            { value: 'lessThanOrEquals', symbol: '<=' }
        ];
    } else if (onlyEquals.includes(questionType)) {
        operators = [{ value: 'equals', symbol: '==' }];
    } else if (onlyContains.includes(questionType)) {
        operators = [{ value: 'contains', symbol: '=' }];
    } else if (containsAndEquals.includes(questionType)) {
        operators = [
            { value: 'contains', symbol: '=' },
            { value: 'equals', symbol: '==' }
        ];
    }

    return (
        <Select
            autoWidth
            className='ruleSelect'
            value={operator}
            onChange={(e: any) => setExpression(e, index, questionType)}>
            {operators.map((o: { value: string; symbol: string }) => {
                return (
                    <MenuItem key={o.value} value={o.value}>
                        {displayOperator(o.value)}
                    </MenuItem>
                );
            })}
        </Select>
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
    const {
        choices,
        answer,
        setAnswer,
        setNumericalAnswer,
        index,
        fact,
        questionType,
        currentQuestion
    } = props;
    const noDropdownTypes = [
        questionTypes.SINGLETEXT,
        questionTypes.TEXTAREA,
        questionTypes.SLIDER,
        questionTypes.RANGE,
        questionTypes.DATETIME
    ];
    let getChoicesDropdown = true;
    let choiceList = choices ? choices : [];

    if (noDropdownTypes.includes(questionType)) {
        getChoicesDropdown = false;
    }

    if (fact === FACTS.age) {
        choiceList = [];
        for (var i = 1; i <= 100; i++) {
            choiceList.push({ order: 0, text: `${i}`, value: `${i}` });
        }
        getChoicesDropdown = true;
    }
    if (fact === FACTS.gender) {
        choiceList = [
            {
                order: 0,
                text: 'male',
                value: 'M'
            },
            {
                order: 1,
                text: 'female',
                value: 'F'
            }
        ];
        getChoicesDropdown = true;
    }
    if (getChoicesDropdown) {
        return (
            <Select
                autoWidth
                className='ruleSelect'
                value={answer}
                onChange={(e: any) => setAnswer(e, index)}>
                {choiceList.map((c: any) => {
                    return (
                        <MenuItem key={`choice-${c.value}`} value={c.value}>
                            {c.value}
                        </MenuItem>
                    );
                })}
            </Select>
        );
    } else if (questionType === questionTypes.DATETIME) {
        const type = currentQuestion.format === dateFormats.MMMDDYYYY ? 'datetime-local' : 'date';
        return (
            <Input
                type={type}
                id='answer-time'
                name='answer-time'
                value={answer}
                onChange={(e: any) => setAnswer(e, index)}
            />
        );
    } else if (questionType === questionTypes.SINGLETEXT || questionType === questionTypes.TEXTAREA) {
        return (
            <Input
                style={{ width: '450px' }}
                value={answer}
                type='text'
                onChange={(e: any) => setAnswer(e, index)}
            />
        );
    } else if (questionType === questionTypes.RANGE) {
        return (
            <Input
                inputProps={{ min: currentQuestion.min, max: currentQuestion.max }}
                style={{ width: '70px', paddingLeft: '10px' }}
                value={answer}
                type='number'
                onChange={(e: any) => setAnswer(e, index)}
            />
        );
    } else if (questionType === questionTypes.SLIDER) {
        return (
            <Input
                inputProps={{ min: currentQuestion.options.min, max: currentQuestion.options.max }}
                style={{ width: '70px', paddingLeft: '10px' }}
                value={answer}
                type='number'
                onChange={(e: any) => setNumericalAnswer(e, index)}
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
    displayFact: Function;
    displayOperator: Function;
}

export const SingleEntry = (props: SingleEntryProps) => {
    const {
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
        questionType,
        displayOperator,
        displayFact
    } = props;
    const { expression } = ruleJson;
    const { operator, value, fact } = expression.entries[index];
    const currentQuestion = questionList.find((q: QuestionnaireQuestion) => q.name === questionId);

    const selectFact = (
        <FactDropdown
            setFact={setFact}
            displayFact={displayFact}
            currentValueOnly={ruleJson.addTo ? true : false}
            fact={fact}
            facts={FACTS}
            index={index}
        />
    );

    const selectOperator = (
        <OperatorDropdown
            fact={fact}
            operator={operator}
            setExpression={setExpression}
            index={index}
            questionType={questionType}
            displayOperator={displayOperator}
        />
    );

    const selectValue = (
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
    );

    return (
        <IonCard>
            <IonCardContent>
                <IonRow>
                    <IonCol>
                        {`condition ${index + 1} :`}&nbsp;&nbsp;
                        {<strong>{selectFact}</strong>}&nbsp;&nbsp;
                        {<strong>{selectOperator}</strong>}&nbsp;&nbsp;
                        {<strong>{selectValue}</strong>}
                    </IonCol>
                    <IonButton fill='clear' color='medium' onClick={() => deleteEntry(ruleJson, index)}>
                        <IonIcon
                            icon={trash}
                            style={{
                                cursor: 'pointer',
                                fontSize: '20px'
                            }}
                        />
                    </IonButton>
                </IonRow>
            </IonCardContent>
        </IonCard>
    );
};

interface SingleEntryDisplayProps {
    ruleJson: QuestionRule;
    index: number;
    displayOperator: Function;
    displayFact: Function;
    displayValue: Function;
}

export const SingleEntryDisplay = (props: SingleEntryDisplayProps) => {
    const { ruleJson, index, displayOperator, displayFact, displayValue } = props;
    const { expression } = ruleJson;
    const { operator, value, fact } = expression.entries[index];

    return (
        <IonGrid>
            <IonRow>
                <IonCol>
                    {`condition ${index + 1} :`}&nbsp;&nbsp;&nbsp;
                    {<strong>{displayFact(fact)}</strong>}&nbsp;&nbsp;
                    {<strong>{displayOperator(operator)}</strong>}&nbsp;&nbsp;
                    {<strong>{displayValue(value)}</strong>}
                </IonCol>
            </IonRow>
        </IonGrid>
    );
};
