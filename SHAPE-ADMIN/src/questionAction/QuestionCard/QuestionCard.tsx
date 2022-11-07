import {
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCheckbox,
    IonCol,
    IonIcon,
    IonItem,
    IonLabel,
    IonReorder,
    IonRow,
    IonGrid
} from '@ionic/react';
import { reorderTwoOutline } from 'ionicons/icons';
import { isEmptyObject } from '../../utils/Utils';
import { questionTypes } from '../../utils/Constants';
import { QuestionnaireQuestionComponent } from '../../interfaces/Components';
import React, { Component } from 'react';
import EditSaveCancelButton from './EditSaveCancelButton';
import BaseQuestion from './BaseQuestion';
import ReorderCard from './ReorderCard';
import InfoCardPalette from '../../questionType/InfoCardComponents/InfoCardPalette';
import InfoCardDisplay from '../../questionType/InfoCardComponents/InfoCardDisplay';
import { QuestionnaireQuestion, QuestionRule } from '../../interfaces/DataTypes';

interface PassedProps {
    question: QuestionnaireQuestionComponent;
    saveRule?: Function;
    deleteRow: Function;
    saveEditedRow: Function;
    handleChange?: Function;
    editRow?: Function;
    cancel?: Function;
    handleRowChange?: Function;
    handleChoiceChange?: Function;
    handleOptionChange?: Function;
    handleSectionChange?: Function;
    load?: Function;
    questionList?: Array<QuestionnaireQuestion>;
    handleRuleChange?: Function;
    editing?: boolean;
    reorder?: boolean;
    locked?: boolean;
    handleChoiceDelete?: Function;
}

class QuestionCard extends Component<PassedProps, {}> {
    handleVariableChange = (event: any) => {
        let { handleRowChange, question } = this.props;
        let name = !isEmptyObject(question.name) ? question.name : question.id;
        handleRowChange(event, name);
    };

    storeSection = (index: number, updatedSectionObject: any) => {
        let { handleSectionChange, question } = this.props;
        let { sections } = question;
        let name = !isEmptyObject(question.name) ? question.name : question.id;
        sections[index] = updatedSectionObject;
        handleSectionChange(sections, name);
    };

    storeSections = (sections: any) => {
        let { handleSectionChange, question } = this.props;
        let name = !isEmptyObject(question.name) ? question.name : question.id;
        handleSectionChange(sections, name);
    };

    addSection = (newSectionObject: any) => {
        let { handleSectionChange, question } = this.props;
        let { sections } = question;
        let name = !isEmptyObject(question.name) ? question.name : question.id;
        sections.push(newSectionObject);
        handleSectionChange(sections, name);
    };

    removeSection = (index: number) => {
        let { handleSectionChange, question } = this.props;
        let { sections } = question;
        let name = !isEmptyObject(question.name) ? question.name : question.id;
        sections.splice(index, 1);
        handleSectionChange(sections, name);
    };

    onClick = (e: any) => {
        let { handleChange } = this.props;
        let {
            name,
            variable,
            title,
            type,
            text,
            format,
            placeholder,
            choices,
            required,
            requiredMessage,
            min,
            max,
            options,
            sections
        } = this.props.question;

        let question: QuestionnaireQuestion = {
            variable: variable,
            name: name,
            title: title,
            type: type
        };

        let rules: QuestionRule[] = !isEmptyObject(this.props.question.rules)
            ? this.props.question.rules
            : [];

        let rm: string = !isEmptyObject(requiredMessage) ? requiredMessage : '';

        switch (type) {
            case questionTypes.INFO:
                question.sections = sections;
                break;
            case questionTypes.TEXTAREA:
            case questionTypes.SINGLETEXT:
                question.text = text;
                question.required = required;
                question.requiredMessage = rm;
                question.rules = rules;
                question.placeholder = !isEmptyObject(placeholder) ? placeholder : '';
                break;
            case questionTypes.DATETIME:
                question.text = text;
                question.required = required;
                question.requiredMessage = rm;
                question.rules = rules;
                question.format = format;
                break;
            case questionTypes.RANGE:
                question.text = text;
                question.required = required;
                question.requiredMessage = rm;
                question.rules = rules;
                question.max = max;
                question.min = min;
                break;
            case questionTypes.SLIDER:
                question.text = text;
                question.required = required;
                question.requiredMessage = rm;
                question.rules = rules;
                question.options = options;
                break;
            case questionTypes.CHECKBOXGROUP:
            case questionTypes.RADIOGROUP:
            case questionTypes.SELECT:
                question.text = text;
                question.required = required;
                question.requiredMessage = rm;
                question.rules = rules;
                question.choices = choices;
                break;
        }

        handleChange(e, question);
    };

    render() {
        let {
            handleChange,
            editRow,
            cancel,
            saveEditedRow,
            deleteRow,
            handleRowChange,
            handleChoiceChange,
            handleOptionChange,
            handleRuleChange,
            reorder,
            locked,
            handleChoiceDelete,
            questionList,
            saveRule
        } = this.props;
        let {
            id,
            name,
            variable,
            title,
            type,
            text,
            placeholder,
            choices,
            editing,
            required,
            requiredMessage,
            min,
            max,
            options,
            sections
        } = this.props.question;

        if (!isEmptyObject(id)) name = id;
        let rules: QuestionRule[] = !isEmptyObject(this.props.question.rules)
            ? this.props.question.rules
            : [];

        return (
            <IonItem key={name}>
                {
                    //question card on questionnaire
                    isEmptyObject(handleChange) && (
                        <IonReorder slot='start'>
                            <IonIcon
                                title='Reorder'
                                style={{ verticalAlign: 'middle' }}
                                icon={reorderTwoOutline}
                            />
                        </IonReorder>
                    )
                }
                {
                    //question card on search and add
                    !isEmptyObject(handleChange) && (
                        <IonCheckbox slot='start' value={name} onClick={(e: any) => this.onClick(e)} />
                    )
                }
                <IonCard style={{ width: '98%', zIndex: '9999' }}>
                    {reorder && (
                        <ReorderCard
                            editing={editing}
                            title={title}
                            handleRowChange={handleRowChange}
                            name={name}
                        />
                    )}
                    {!reorder && (
                        <IonCardHeader>
                            <IonCardTitle>
                                <IonRow>
                                    <IonCol size='2'>
                                        <IonLabel
                                            className='ion-text-wrap'
                                            color='primary'
                                            style={{ fontSize: '12px' }}>
                                            {type}
                                        </IonLabel>
                                    </IonCol>
                                    <IonCol size='10'>
                                        {!reorder && (
                                            <EditSaveCancelButton
                                                editing={editing}
                                                edit={() => editRow(name)}
                                                save={() => saveEditedRow(name)}
                                                cancel={() => cancel(name)}
                                                archive={() => deleteRow(name)}
                                                locked={locked}
                                            />
                                        )}
                                    </IonCol>
                                </IonRow>
                                {type !== questionTypes.INFO && (
                                    <BaseQuestion
                                        editing={editing}
                                        title={title}
                                        variable={variable}
                                        text={text}
                                        required={required}
                                        requiredMessage={requiredMessage}
                                        name={name}
                                        type={type}
                                        placeholder={placeholder}
                                        min={min}
                                        max={max}
                                        options={options}
                                        rules={rules}
                                        handleChoiceDelete={handleChoiceDelete}
                                        handleChoiceChange={handleChoiceChange}
                                        choices={choices}
                                        questionList={questionList}
                                        handleOptionChange={handleOptionChange}
                                        handleRowChange={handleRowChange}
                                        handleRuleChange={handleRuleChange}
                                        saveRule={saveRule}
                                    />
                                )}
                                {type === questionTypes.INFO && (
                                    <IonGrid>
                                        <IonRow>
                                            <IonCol size='6'>
                                                <InfoCardPalette
                                                    editing={editing}
                                                    variable={variable}
                                                    sections={sections}
                                                    handleVariableChange={this.handleVariableChange}
                                                    storeSection={this.storeSection}
                                                    storeSections={this.storeSections}
                                                    removeSection={this.removeSection}
                                                    addSection={this.addSection}
                                                />
                                            </IonCol>
                                            <IonCol size='6'>
                                                <InfoCardDisplay sections={sections} />
                                            </IonCol>
                                        </IonRow>
                                    </IonGrid>
                                )}
                            </IonCardTitle>
                        </IonCardHeader>
                    )}
                </IonCard>
            </IonItem>
        );
    }
}

export default QuestionCard;
