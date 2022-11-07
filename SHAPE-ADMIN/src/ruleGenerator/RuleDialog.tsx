import React, { useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import { IonIcon, IonItem, IonLabel } from '@ionic/react';
import { Rule } from '../ruleGenerator';
import { isEmptyObject } from '../utils/Utils';
import { QuestionRule, QuestionnaireQuestion, Options, QuestionRuleEntry } from '../interfaces/DataTypes';
import { questionTypes } from '../utils/Constants';
import { addCircle } from 'ionicons/icons';

interface Props {
    open: boolean;
    handleClose: Function;
    handleCancel: Function;
    ruleJson: QuestionRule;
    deleteRule: Function;
    updateRule: Function;
    questionList: Array<QuestionnaireQuestion>;
    questionId: string;
    selectEditRule: Function;
    saveRule: Function;
    deleteEntry: Function;
    questionType: string;
    min: string;
    max: string;
    options: Options;
}

const RuleDialog = (props: Props) => {
    const [error, setError] = useState(false);
    const {
        open,
        handleClose,
        handleCancel,
        ruleJson,
        deleteRule,
        updateRule,
        questionList,
        questionId,
        selectEditRule,
        saveRule,
        deleteEntry,
        questionType,
        min,
        max,
        options
    } = props;

    const validate = () => {
        const entries = ruleJson.expression.entries;
        let valid = true;
        entries.forEach((elem: QuestionRuleEntry) => {
            if (
                (isEmptyObject(ruleJson.skipTo) && isEmptyObject(ruleJson.addTo)) ||
                isEmptyObject(elem.fact) ||
                isEmptyObject(elem.operator) ||
                isEmptyObject(elem.value)
            ) {
                valid = false;
            } else if (elem.fact === 'currentValue') {
                if (questionType === questionTypes.RANGE) {
                    if (
                        parseInt(elem.value as string) > parseInt(max as string) ||
                        parseInt(elem.value as string) < parseInt(min as string)
                    ) {
                        valid = false;
                    }
                }
                if (questionType === questionTypes.SLIDER) {
                    if (
                        parseInt(elem.value as string) > parseInt(options.max as string) ||
                        parseInt(elem.value as string) < parseInt(options.min as string)
                    ) {
                        valid = false;
                    }
                }
            }
        });
        return valid;
    };

    const handleDialogSave = () => {
        const valid = validate();
        if (valid) {
            saveRule();
            handleClose();
        } else {
            setError(true);
        }
    };

    const addEntry = () => {
        let tempEntry = {
            fact: 'currentValue',
            operator: '',
            value: ''
        };
        ruleJson.expression.entries.push(tempEntry);
        updateRule(ruleJson);
    };

    return (
        <Dialog open={open} onClose={(event, reason) => handleClose(reason)} maxWidth='md' fullWidth={true}>
            <DialogTitle>Rule Editor</DialogTitle>
            <DialogContent dividers>
                <Rule
                    key={'dialogue-rule-obj'}
                    dialogMode={true}
                    ruleJson={ruleJson}
                    deleteRule={deleteRule}
                    deleteEntry={deleteEntry}
                    updateRule={updateRule}
                    editing={false}
                    questionList={questionList}
                    questionId={questionId}
                    selectEditRule={selectEditRule}
                    saveRule={saveRule}
                    questionType={questionType}
                />
                <IonItem button style={{ width: '190px' }} lines='none' onClick={() => addEntry()}>
                    <IonIcon
                        icon={addCircle}
                        style={{ cursor: 'pointer', paddingRight: '5px', paddingBottom: '5px' }}
                    />
                    <IonLabel style={{ cursor: 'pointer' }}>Add Condition</IonLabel>
                </IonItem>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleDialogSave} color='primary'>
                    Save changes
                </Button>
                <Button onClick={() => handleCancel()} color='primary'>
                    Cancel
                </Button>
            </DialogActions>
            {error && (
                <span style={{ padding: '8px', textAlign: 'right' }}>
                    <IonLabel color='danger'>Invalid field.</IonLabel>
                </span>
            )}
        </Dialog>
    );
};

export default RuleDialog;
