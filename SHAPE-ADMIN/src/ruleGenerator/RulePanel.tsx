import React, { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { IonCardContent, IonIcon, IonItem, IonLabel, IonText } from '@ionic/react';
import { addCircle } from 'ionicons/icons';
import { Rule } from '../ruleGenerator';
import { QuestionRule, QuestionnaireQuestion, Options } from '../interfaces/DataTypes';
import RuleDialog from './RuleDialog';

interface RPProps extends RouteComponentProps {
    setRules: Function;
    saveRule: Function;
    editing?: boolean;
    rules: Array<QuestionRule>;
    questionList: Array<QuestionnaireQuestion>;
    questionId?: string;
    questionType?: string;
    min?: string;
    max?: string;
    options?: Options;
}

interface RPState {
    showDialogue: boolean;
    displayedRule: QuestionRule;
    isNew: boolean;
    editingRule: string;
}

class RulePanel extends Component<RPProps, RPState> {
    constructor(props: RPProps) {
        super(props);
        this.state = {
            showDialogue: false,
            displayedRule: null,
            isNew: false,
            editingRule: null
        };
    }

    addRule = () => {
        const { rules } = this.props;
        let key = rules.length;
        if (rules.length > 0) {
            key = rules[rules.length - 1].id + 1;
        }
        const ruleJson: QuestionRule = {
            id: key,
            skipTo: '',
            ruleType: 'or',
            expression: {
                entries: [
                    {
                        fact: 'currentValue',
                        operator: '',
                        value: ''
                    }
                ]
            }
        };
        const newRules = [...this.props.rules, ruleJson];
        this.props.setRules(newRules, this.props.questionId);
        this.setState({ isNew: true, editingRule: null });
    };

    deleteRule = (rule: any) => {
        const { id } = rule.props.ruleJson;
        const tempRules = this.props.rules;
        const index = tempRules.findIndex((r) => r.id === id);
        if (index > -1) {
            tempRules.splice(index, 1);
            this.props.setRules([...tempRules], this.props.questionId);
        }
    };

    deleteEntry = (ruleJson: QuestionRule, entryId: number) => {
        const { id } = ruleJson; // id of rule
        const tempRules = this.props.rules;
        const index = tempRules.findIndex((rule) => rule.id === id);
        if (index > -1) {
            const currentRule = tempRules[index];
            currentRule.expression.entries.splice(entryId, 1);
            this.props.setRules([...tempRules], this.props.questionId);
        }
    };

    updateRule = (rule: QuestionRule) => {
        const { id } = rule;
        const tempRules = this.props.rules;
        const index = tempRules.findIndex((r) => r.id === id);
        if (index > -1) {
            tempRules[index] = rule;
            this.props.setRules([...tempRules], this.props.questionId);
        }
    };

    generateRulesList = () => {
        const { rules, questionId } = this.props;
        const ruleList: any = [];
        rules.forEach((rule: any, i: number) => {
            ruleList.push(
                <Rule
                    key={`${questionId}-${i}`}
                    questionList={this.props.questionList}
                    ruleJson={rule}
                    deleteRule={this.deleteRule}
                    updateRule={this.updateRule}
                    deleteEntry={this.deleteEntry}
                    dialogMode={false}
                    editing={this.props.editing}
                    questionId={questionId}
                    selectEditRule={this.selectEditRule}
                    saveRule={this.props.saveRule}
                    questionType={this.props.questionType}
                />
            );
        });
        return ruleList;
    };

    selectEditRule = (rule: any) => {
        const { ruleJson } = rule.props;
        this.setState({
            displayedRule: ruleJson,
            showDialogue: true,
            editingRule: JSON.stringify(ruleJson)
        });
    };

    handleCancel = () => {
        const { rules } = this.props;
        const { isNew, editingRule } = this.state;
        try {
            if (isNew) {
                rules.pop();
                this.props.setRules(rules, this.props.questionId);
                this.setState({ isNew: false, editingRule: null });
            } else {
                const restoredRule = JSON.parse(editingRule);
                const tempRules = this.props.rules;
                const index = tempRules.findIndex((rule) => rule.id === restoredRule.id);
                if (index > -1) {
                    tempRules[index] = restoredRule;
                    this.props.setRules([...tempRules], this.props.questionId);
                }
            }
        } catch (e) {
            console.error(`An error has occurred`, e);
        }
        this.setState({
            showDialogue: false
        });
    };

    handleClose = (reason: string) => {
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') return;
        this.setState({
            showDialogue: false,
            isNew: false
        });
    };

    handleOpen = () => {
        const self = this;
        const setNewRule = new Promise((resolve, reject) => {
            self.addRule();
            const wait = setTimeout(() => {
                clearTimeout(wait);
                resolve('Done');
            }, 200);
        });

        setNewRule
            .then((res) => {
                const n = self.props.rules.length;
                const currentDisplayedRule = self.props.rules[n - 1];
                self.setState({
                    displayedRule: currentDisplayedRule,
                    showDialogue: true
                });
            })
            .catch((err: any) => {
                console.error(err);
            });
    };

    render() {
        const {
            rules,
            editing,
            questionList,
            questionId,
            questionType,
            saveRule,
            min,
            max,
            options
        } = this.props;
        const { showDialogue, displayedRule } = this.state;

        return (
            <IonCardContent>
                {!editing && <IonText color='dark'>{rules.length === 0 && 'None'}</IonText>}
                {rules.length > 0 && <>{this.generateRulesList()}</>}
                {editing && (
                    <IonItem button style={{ width: '150px' }} lines='none' onClick={this.handleOpen}>
                        <IonIcon
                            icon={addCircle}
                            style={{ cursor: 'pointer', paddingRight: '5px', paddingBottom: '5px' }}
                        />
                        <IonLabel style={{ cursor: 'pointer' }}>Add Rule</IonLabel>
                    </IonItem>
                )}
                {showDialogue && (
                    <RuleDialog
                        deleteRule={this.deleteRule}
                        deleteEntry={this.deleteEntry}
                        updateRule={this.updateRule}
                        handleClose={this.handleClose}
                        handleCancel={this.handleCancel}
                        selectEditRule={this.selectEditRule}
                        questionId={questionId}
                        questionList={questionList}
                        open={showDialogue}
                        ruleJson={displayedRule}
                        saveRule={saveRule}
                        questionType={questionType}
                        min={min}
                        max={max}
                        options={options}
                    />
                )}
            </IonCardContent>
        );
    }
}

export default withRouter(RulePanel);
