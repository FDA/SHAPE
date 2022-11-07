import { Component } from 'react';
import { IonItem, IonGrid, IonRow, IonCol, IonIcon, IonCard, IonButton, IonButtons } from '@ionic/react';
import { trash } from 'ionicons/icons';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import './RuleGenerator.css';
import { SingleEntry, SkipToDropdown, SingleEntryDisplay, AddToDropdown } from './SingleEntry';
import { QuestionRule, QuestionnaireQuestion, Questionnaire } from '../interfaces/DataTypes';
import Loading from '../layout/Loading';
import { connect } from 'react-redux';

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
    questionnaireList: Questionnaire[];
    questionnaireId: string;
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

    setEventType = (value: any) => {
        const { ruleJson, updateRule } = this.props;
        if (value === 'add') {
            delete ruleJson.skipTo;
            ruleJson.addTo = '';
            return updateRule(ruleJson);
        } else if (value === 'skip') {
            delete ruleJson.addTo;
            ruleJson.skipTo = '';
            return updateRule(ruleJson);
        }
    };

    setAnswer = (e: any, index: number) => {
        this.props.ruleJson.expression.entries[index].value = e.target.value;
        this.props.updateRule(this.props.ruleJson);
    };

    setNumericalAnswer = (e: any, index: number) => {
        this.props.ruleJson.expression.entries[index].value = parseInt(e.target.value);
        this.props.updateRule(this.props.ruleJson);
    };

    setSkipTo = (e: any) => {
        const { ruleJson } = this.props;
        ruleJson.skipTo = e;
        delete ruleJson.addTo;
        this.props.updateRule(this.props.ruleJson);
    };

    setAddTo = (e: any) => {
        const { ruleJson } = this.props;
        ruleJson.addTo = e;
        delete ruleJson.skipTo;
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

    displayOperator = (operator: string) => {
        switch (operator) {
            case 'equals':
                return 'is equal to';
            case 'contains':
                return 'contains';
            case 'greaterThanOrEquals':
                return 'is greater than or equal to';
            case 'greaterThan':
                return 'is greater than';
            case 'lessThan':
                return 'is less than';
            case 'lessThanOrEquals':
                return 'is less than or equal to';
            default:
                return operator;
        }
    };

    displayFact = (fact: string) => {
        switch (fact) {
            case 'currentValue':
                return 'answer';
            case 'profile.gender':
                return 'gender';
            case 'profile.age':
                return 'age';
            default:
                return fact;
        }
    };

    displayValue = (value: any) => {
        switch (value) {
            case 'M':
                return 'male';
            case 'F':
                return 'female';
            default:
                return value;
        }
    };

    getQuestionChoices = (questionId: string) => {
        const matched = this.props.questionList.find((e) => e.name === questionId);
        if (matched) {
            return matched.choices;
        }
        return null;
    };

    getTitleFromName = (name: string) => {
        const { questionList } = this.props;
        const found = questionList.find((q) => q.name === name);
        return found ? found.title : '';
    };

    getQuestionnaireName = () => {
        const { questionnaireList, ruleJson } = this.props;
        const questionnaireId = ruleJson.addTo;
        return questionnaireList.filter((q: any) => q.id === questionnaireId).map((q: any) => q.name)[0];
    };

    getDialogDisplayRule = () => {
        const {
            ruleJson,
            questionId,
            questionList,
            questionType,
            questionnaireList,
            questionnaireId
        } = this.props;
        const eventType = ruleJson.hasOwnProperty('addTo') ? 'add' : 'skip';

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
            choices,
            displayOperator: this.displayOperator,
            displayFact: this.displayFact
        };
        if (!ruleJson) return <Loading></Loading>;
        return (
            <div>
                <IonGrid>
                    <IonRow>
                        <IonCol size='12'>
                            {'If'}&nbsp;&nbsp;
                            <Select
                                autoWidth
                                className='ruleSelect'
                                value={this.props.ruleJson.ruleType}
                                onChange={(e: any) => this.setRuleType(e)}>
                                <MenuItem value='or'>any</MenuItem>
                                <MenuItem value='and'>all</MenuItem>
                            </Select>
                            &nbsp;&nbsp;
                            {'conditions below are met, '}&nbsp;&nbsp;
                            <Select
                                autoWidth
                                className='ruleSelect'
                                value={eventType}
                                onChange={(e: any) => this.setEventType(e.target.value)}>
                                <MenuItem value='add'>add to questionnaire</MenuItem>
                                <MenuItem value='skip'>skip to question</MenuItem>
                            </Select>
                            &nbsp;&nbsp;
                            {eventType === 'add' && (
                                <AddToDropdown
                                    questionnaireId={questionnaireId}
                                    questionnaireList={questionnaireList}
                                    addTo={this.props.ruleJson.addTo}
                                    setAddTo={this.setAddTo}
                                />
                            )}
                            {eventType === 'skip' && (
                                <SkipToDropdown
                                    questionId={questionId}
                                    questionList={questionList}
                                    skipTo={this.props.ruleJson.skipTo}
                                    setSkipTo={this.setSkipTo}
                                />
                            )}
                        </IonCol>
                    </IonRow>
                </IonGrid>
                {ruleJson.expression.entries.map((e: any, i: number) => {
                    return <SingleEntry {...SingleEntryProps} index={i} key={`single-entry-${i}`} />;
                })}
            </div>
        );
    };

    getDisplayRule = () => {
        const { ruleJson, editing } = this.props;
        const { skipTo, addTo, ruleType } = ruleJson;

        const SingleEntryDisplayProps = {
            displayOperator: this.displayOperator,
            displayFact: this.displayFact,
            displayValue: this.displayValue,
            ruleJson
        };

        return (
            <IonCard>
                <IonGrid class='ruleGrid'>
                    <IonRow>
                        <IonCol class='ruleCol' size='12'>
                            <IonItem color='light'>
                                {'If'}&nbsp;&nbsp;
                                {ruleType === 'or' ? <strong>any</strong> : <strong>all</strong>}&nbsp;&nbsp;
                                {'conditions below are met,'}&nbsp;&nbsp;
                                {addTo && (
                                    <strong>
                                        add to questionnaire : &nbsp;&nbsp;{this.getQuestionnaireName()}
                                    </strong>
                                )}
                                {skipTo && (
                                    <strong>
                                        skip to question : &nbsp;&nbsp;{this.getTitleFromName(skipTo)}
                                    </strong>
                                )}
                                {editing && (
                                    <IonButtons slot='end'>
                                        <IonButton onClick={() => this.props.selectEditRule(this)}>
                                            Edit
                                        </IonButton>
                                        &nbsp;&nbsp;
                                        <IonButton
                                            fill='clear'
                                            color='dark'
                                            onClick={() => this.props.deleteRule(this)}>
                                            <IonIcon
                                                icon={trash}
                                                style={{
                                                    paddingBottom: '.25em',
                                                    cursor: 'pointer',
                                                    fontSize: '25px'
                                                }}
                                            />
                                        </IonButton>
                                    </IonButtons>
                                )}
                            </IonItem>
                        </IonCol>
                    </IonRow>
                    {ruleJson.expression.entries.map((e: any, i: number) => {
                        return (
                            <SingleEntryDisplay
                                {...SingleEntryDisplayProps}
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
        const { dialogMode } = this.props;
        return (
            <div>
                {!dialogMode && this.getDisplayRule()}
                {dialogMode && this.getDialogDisplayRule()}
            </div>
        );
    }
}

function mapStateToProps(state: any) {
    return {
        questionnaireList: state.questionnaireList,
        questionnaireId: state.questionnaire.id
    };
}

function mapDispatchToProps(dispatch: any) {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(Rule);
