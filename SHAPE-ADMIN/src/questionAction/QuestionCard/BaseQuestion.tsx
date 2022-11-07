import {
    IonRow,
    IonCol,
    IonLabel,
    IonTextarea,
    IonItem,
    IonInput,
    IonCheckbox,
    IonCardContent,
    IonButton,
    IonList,
    IonItemGroup,
    IonGrid
} from '@ionic/react';
import React, { Component } from 'react';
import { RulePanel } from '../../ruleGenerator';
import { isEmptyObject, guid } from '../../utils/Utils';
import { Options, QuestionRule, QuestionChoice, QuestionnaireQuestion } from '../../interfaces/DataTypes';
import { questionTypes } from '../../utils/Constants';

interface PassedProps {
    name: string;
    variable: string;
    title: string;
    type: string;
    text: string;
    placeholder: string;
    editing: boolean;
    required: boolean;
    requiredMessage: string;
    min: string;
    max: string;
    options: Options;
    rules: Array<QuestionRule>;
    choices: Array<QuestionChoice>;
    questionList: Array<QuestionnaireQuestion>;
    handleRowChange: Function;
    handleOptionChange: Function;
    handleRuleChange: Function;
    saveRule: Function;
    handleChoiceChange: Function;
    handleChoiceDelete: Function;
}

interface State {
    choices: Array<QuestionChoice>;
}

class BaseQuestion extends Component<PassedProps & State> {
    render() {
        const {
            name,
            variable,
            title,
            type,
            text,
            placeholder,
            editing,
            required,
            requiredMessage,
            min,
            max,
            options,
            rules,
            choices,
            handleRuleChange,
            handleRowChange,
            handleOptionChange,
            questionList,
            saveRule,
            handleChoiceChange,
            handleChoiceDelete
        } = this.props;
        return (
            <>
                <IonRow>
                    <IonCol size='6'>
                        <IonItem>
                            <IonLabel position='stacked' color='secondary'>
                                Question
                            </IonLabel>
                            <IonTextarea
                                color='dark'
                                rows={1}
                                autoGrow={false}
                                readonly={!editing}
                                value={title}
                                name={'title'}
                                title={'Question'}
                                onIonBlur={(e: any) => handleRowChange(e, name)}
                            />
                        </IonItem>
                    </IonCol>
                    <IonCol size='6'>
                        <IonItem>
                            <IonLabel position='stacked' color='secondary'>
                                Variable
                            </IonLabel>
                            <IonTextarea
                                color='dark'
                                rows={1}
                                autoGrow={false}
                                readonly={!editing}
                                value={variable}
                                name={'variable'}
                                title={'variable'}
                                onIonBlur={(e: any) => handleRowChange(e, name)}
                            />
                        </IonItem>
                    </IonCol>
                </IonRow>
                <IonRow>
                    <IonCol size='6'>
                        <IonItem>
                            <IonLabel position='stacked' color='secondary'>
                                Instructions
                            </IonLabel>
                            <IonTextarea
                                color='dark'
                                rows={1}
                                autoGrow={false}
                                readonly={!editing}
                                value={text}
                                name={'text'}
                                title={'Instructions'}
                                onIonBlur={(e: any) => handleRowChange(e, name)}
                            />
                        </IonItem>
                    </IonCol>
                    <IonCol size='2'>
                        <IonItem>
                            <IonCheckbox
                                checked={required}
                                name={'required'}
                                title={'required'}
                                disabled={!editing}
                                onIonBlur={(e: any) => handleRowChange(e, name)}
                            />
                            <IonLabel color='secondary'>&nbsp;&nbsp;Required</IonLabel>
                        </IonItem>
                    </IonCol>
                    <IonCol size='4'>
                        <IonItem>
                            <IonLabel position='stacked' color='secondary'>
                                Required Question Instructions
                            </IonLabel>
                            <IonInput
                                name={'requiredMessage'}
                                title={'requiredMessage'}
                                value={requiredMessage}
                                readonly={!editing}
                                placeholder={'"A value is required for this question."'}
                                onIonBlur={(e: any) => handleRowChange(e, name)}
                            />
                        </IonItem>
                    </IonCol>
                </IonRow>
                {(type === questionTypes.SINGLETEXT || type === questionTypes.TEXTAREA) && (
                    <IonRow>
                        <IonCol size='12'>
                            <IonItem>
                                <IonLabel position='stacked' color='secondary'>
                                    Placeholder
                                </IonLabel>
                                <IonTextarea
                                    color='dark'
                                    rows={1}
                                    autoGrow={false}
                                    value={placeholder}
                                    name={'placeholder'}
                                    title={'placeholder'}
                                    readonly={!editing}
                                    onIonBlur={(e: any) => handleRowChange(e, name)}
                                />
                            </IonItem>
                        </IonCol>
                    </IonRow>
                )}
                {type === questionTypes.RANGE && (
                    <IonRow>
                        <IonCol size='6'>
                            <IonItem>
                                <IonLabel position='stacked' color='secondary'>
                                    Min Value
                                </IonLabel>
                                <IonInput
                                    name={'min'}
                                    title={'min'}
                                    inputMode={'numeric'}
                                    value={min}
                                    readonly={!editing}
                                    placeholder={'0'}
                                    onIonBlur={(e: any) => handleRowChange(e, name)}
                                />
                            </IonItem>
                        </IonCol>
                        <IonCol size='6'>
                            <IonItem>
                                <IonLabel position='stacked' color='secondary'>
                                    Max Value
                                </IonLabel>
                                <IonInput
                                    name={'max'}
                                    title={'max'}
                                    inputMode={'numeric'}
                                    value={max}
                                    readonly={!editing}
                                    placeholder={'0'}
                                    onIonBlur={(e: any) => handleRowChange(e, name)}
                                />
                            </IonItem>
                        </IonCol>
                    </IonRow>
                )}
                {type === questionTypes.SLIDER && (
                    <IonRow>
                        <IonCol size='4'>
                            <IonItem>
                                <IonLabel color='secondary' position='stacked'>
                                    Lower:
                                </IonLabel>
                                <IonInput
                                    name='min'
                                    title='min'
                                    type='number'
                                    readonly={!editing}
                                    value={!isEmptyObject(options) ? options.min : 0}
                                    onIonChange={(e) => handleOptionChange(e, name)}
                                />
                            </IonItem>
                        </IonCol>
                        <IonCol size='4'>
                            <IonItem>
                                <IonLabel color='secondary' position='stacked'>
                                    Upper:
                                </IonLabel>
                                <IonInput
                                    type='number'
                                    readonly={!editing}
                                    name='max'
                                    title='max'
                                    value={!isEmptyObject(options) ? options.max : 100}
                                    onIonChange={(e) => handleOptionChange(e, name)}
                                />
                            </IonItem>
                        </IonCol>
                        <IonCol size='4'>
                            <IonItem>
                                <IonLabel color='secondary' position='stacked'>
                                    Step:
                                </IonLabel>
                                <IonInput
                                    type='number'
                                    readonly={!editing}
                                    name='step'
                                    title='step'
                                    value={!isEmptyObject(options) ? options.step : 1}
                                    onIonChange={(e) => handleOptionChange(e, name)}
                                />
                            </IonItem>
                        </IonCol>
                    </IonRow>
                )}
                {(type === questionTypes.RADIOGROUP ||
                    type === questionTypes.CHECKBOXGROUP ||
                    type === questionTypes.SELECT) && (
                    <IonCardContent>
                        <IonLabel color='primary' position='stacked'>
                            Choices&nbsp;&nbsp;&nbsp;
                            {editing && (
                                <IonButton
                                    title='add choice'
                                    onClick={() => {
                                        choices.push({
                                            index: guid(),
                                            order: choices.length,
                                            text: '',
                                            value: ''
                                        });
                                        this.setState({ choices: choices });
                                    }}>
                                    +
                                </IonButton>
                            )}
                        </IonLabel>
                        <br />
                        <IonList>
                            <IonItemGroup>
                                {choices.map((choice: QuestionChoice, index: number) => {
                                    return (
                                        <div key={index}>
                                            <IonItem>
                                                {editing && (
                                                    <IonButton
                                                        size='small'
                                                        slot='end'
                                                        title='delete choice'
                                                        onClick={() =>
                                                            handleChoiceDelete(name, choice.index)
                                                        }>
                                                        x
                                                    </IonButton>
                                                )}
                                                <IonGrid>
                                                    <IonRow>
                                                        <IonCol size={'2'}>
                                                            <IonItem className='ion-no-padding' lines='none'>
                                                                <IonLabel
                                                                    color='secondary'
                                                                    position='stacked'>
                                                                    Value
                                                                </IonLabel>
                                                                <IonTextarea
                                                                    autoGrow={true}
                                                                    rows={1}
                                                                    color='dark'
                                                                    readonly={!editing}
                                                                    value={choice.value}
                                                                    name={`value-${choices.indexOf(choice)}`}
                                                                    onIonInput={(e) =>
                                                                        handleChoiceChange(e, name)
                                                                    }
                                                                />
                                                            </IonItem>
                                                        </IonCol>
                                                        <IonCol size={'10'}>
                                                            <IonItem className='ion-no-padding' lines='none'>
                                                                <IonLabel
                                                                    color='secondary'
                                                                    position='stacked'>
                                                                    Text
                                                                </IonLabel>
                                                                <IonTextarea
                                                                    autoGrow={true}
                                                                    rows={1}
                                                                    color='dark'
                                                                    readonly={!editing}
                                                                    value={choice.text}
                                                                    name={`text-${choices.indexOf(choice)}`}
                                                                    onIonInput={(e) =>
                                                                        handleChoiceChange(e, name)
                                                                    }
                                                                />
                                                            </IonItem>
                                                        </IonCol>
                                                    </IonRow>
                                                </IonGrid>
                                            </IonItem>
                                        </div>
                                    );
                                })}
                            </IonItemGroup>
                        </IonList>
                    </IonCardContent>
                )}
                <IonCardContent>
                    <IonLabel color='primary' position='stacked'>
                        Rules
                    </IonLabel>
                    <RulePanel
                        setRules={handleRuleChange}
                        editing={editing}
                        rules={rules}
                        questionList={questionList}
                        questionId={name}
                        questionType={type}
                        saveRule={() => saveRule(name)}
                        min={min}
                        max={max}
                        options={options}
                    />
                </IonCardContent>
            </>
        );
    }
}

export default BaseQuestion;
