import React, {useState} from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import {IonLabel} from '@ionic/react';
import {Rule} from '../ruleGenerator';
import {isEmptyObject} from '../utils/Utils';
import {
    QuestionRule,
    QuestionnaireQuestion,
    Options,
    QuestionRuleEntry
} from '../interfaces/DataTypes';
import {questionTypes} from '../utils/Constants';

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
    min: string | number;
    max: string | number;
    options: Options;
}

const RuleDialog = (props: Props) => {
    const [error, setError] = useState(false);

    let {
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

    function validate() {
        let valid = true;
        let entries = ruleJson.expression.entries;
        entries.forEach((elem: QuestionRuleEntry) => {
            if (
                isEmptyObject(ruleJson.skipTo) ||
                isEmptyObject(elem.fact) ||
                isEmptyObject(elem.operator) ||
                isEmptyObject(elem.value)
            )
                valid = false;

            if (elem.fact === 'currentValue') {
                if (questionType === questionTypes.RANGE) {
                    if (
                        parseInt(elem.value as string) >
                            parseInt(max as string) ||
                        parseInt(elem.value as string) < parseInt(min as string)
                    ) {
                        valid = false;
                    }
                }

                if (questionType === questionTypes.SLIDER) {
                    if (
                        parseInt(elem.value as string) >
                            parseInt(options.max as string) ||
                        parseInt(elem.value as string) <
                            parseInt(options.min as string)
                    ) {
                        valid = false;
                    }
                }
            }
        });
        return valid;
    }

    function handleDialogSave() {
        let valid = validate();
        if (valid) {
            saveRule();
            handleClose();
        } else {
            setError(true);
        }
    }

    return (
        <Dialog
            open={open}
            onClose={() => handleClose()}
            fullWidth={true}
            disableEscapeKeyDown={true}>
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

                <pre
                    id="json"
                    style={{
                        marginLeft: '2vw',
                        marginRight: '2vw',
                        cursor: 'default',
                        color: 'black',
                        backgroundColor: '#BBBBBC',
                        border: '2px solid #3E3E3F'
                    }}>
                    <code>{JSON.stringify(ruleJson, null, 2)}</code>
                </pre>
            </DialogContent>
            <DialogActions>
                <Button autoFocus onClick={handleDialogSave} color="primary">
                    Save changes
                </Button>
                <Button
                    autoFocus
                    onClick={() => handleCancel()}
                    color="primary">
                    Cancel
                </Button>
            </DialogActions>
            {error && (
                <span style={{padding: '8px', textAlign: 'right'}}>
                    <IonLabel color="danger">Invalid field.</IonLabel>
                </span>
            )}
        </Dialog>
    );
};

export default RuleDialog;
