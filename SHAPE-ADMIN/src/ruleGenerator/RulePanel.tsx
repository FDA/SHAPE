import React, {Component} from 'react';
import {RouteComponentProps, withRouter} from 'react-router-dom';
import {IonCardContent, IonIcon, IonText} from '@ionic/react';
import {addCircle} from 'ionicons/icons';
import {Rule} from '../ruleGenerator';
import {
    QuestionRule,
    QuestionnaireQuestion,
    Options
} from '../interfaces/DataTypes';
import RuleDialog from './RuleDialog';

interface RPProps extends RouteComponentProps {
    setRules: Function;
    saveRule: Function;
    editing?: boolean;
    rules: Array<QuestionRule>;
    questionList: Array<QuestionnaireQuestion>;
    questionId?: string;
    questionType?: string;
    min?: number;
    max?: number;
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
        let {rules} = this.props;
        let key = rules.length;
        if (rules.length > 0) {
            key = rules[rules.length - 1].id + 1;
        }
        let ruleJson: QuestionRule = {
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
        let newRules = [...this.props.rules, ruleJson];
        this.props.setRules(newRules, this.props.questionId);
        this.setState({isNew: true, editingRule: null});
    };

    deleteRule = (rule: any) => {
        let {id} = rule.props.ruleJson;
        let tempRules = this.props.rules;
        let index = tempRules.findIndex((r) => r.id === id);
        if (index > -1) {
            tempRules.splice(index, 1);
            this.props.setRules([...tempRules], this.props.questionId);
        }
    };

    deleteEntry = (ruleJson: QuestionRule, entryId: number) => {
        let {id} = ruleJson; // id of rule
        let tempRules = this.props.rules;
        let index = tempRules.findIndex((rule) => rule.id === id);
        if (index > -1) {
            let currentRule = tempRules[index];
            currentRule.expression.entries.splice(entryId, 1);
            this.props.setRules([...tempRules], this.props.questionId);
        }
    };

    updateRule = (rule: QuestionRule) => {
        let {id} = rule;
        let tempRules = this.props.rules;
        let index = tempRules.findIndex((r) => r.id === id);
        if (index > -1) {
            tempRules[index] = rule;
            this.props.setRules([...tempRules], this.props.questionId);
        }
    };

    generateRulesList = () => {
        let result = [];
        let {rules} = this.props;
        let {questionId} = this.props;
        for (let i = 0; i < rules.length; i++) {
            let newRule = (
                <Rule
                    key={`${questionId}-${i}`}
                    questionList={this.props.questionList}
                    ruleJson={rules[i]}
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
            result.push(newRule);
        }

        return result;
    };

    selectEditRule = (rule: any) => {
        let {ruleJson} = rule.props;
        this.setState({
            displayedRule: ruleJson,
            showDialogue: true,
            editingRule: JSON.stringify(ruleJson)
        });
    };

    handleCancel = () => {
        const {rules} = this.props;
        const {isNew, editingRule} = this.state;
        try {
            if (isNew) {
                rules.pop();
                this.props.setRules(rules, this.props.questionId);
                this.setState({isNew: false, editingRule: null});
            } else {
                const restoredRule = JSON.parse(editingRule);
                let tempRules = this.props.rules;
                let index = tempRules.findIndex(
                    (rule) => rule.id === restoredRule.id
                );
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

    handleClose = () => {
        this.setState({
            showDialogue: false,
            isNew: false
        });
    };

    handleOpen = () => {
        let self = this;
        let setNewRule = new Promise((resolve, reject) => {
            self.addRule();
            let wait = setTimeout(() => {
                clearTimeout(wait);
                resolve('Done');
            }, 200);
        });

        setNewRule
            .then((res) => {
                let n = self.props.rules.length;
                let currentDisplayedRule = self.props.rules[n - 1];
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
        return (
            <IonCardContent>
                <IonText color="dark">
                    {this.props.rules.length === 0 && 'None'}
                </IonText>
                {this.props.editing && (
                    <IonIcon
                        icon={addCircle}
                        style={{
                            fontSize: '20px',
                            cursor: 'pointer'
                        }}
                        onClick={this.handleOpen}
                    />
                )}
                {this.props.rules.length > 0 && <>{this.generateRulesList()}</>}
                {this.state.showDialogue && (
                    <RuleDialog
                        deleteRule={this.deleteRule}
                        deleteEntry={this.deleteEntry}
                        updateRule={this.updateRule}
                        handleClose={this.handleClose}
                        handleCancel={this.handleCancel}
                        selectEditRule={this.selectEditRule}
                        questionId={this.props.questionId}
                        questionList={this.props.questionList}
                        open={this.state.showDialogue}
                        ruleJson={this.state.displayedRule}
                        saveRule={this.props.saveRule}
                        questionType={this.props.questionType}
                        min={this.props.min}
                        max={this.props.max}
                        options={this.props.options}
                    />
                )}
            </IonCardContent>
        );
    }
}

export default withRouter(RulePanel);
