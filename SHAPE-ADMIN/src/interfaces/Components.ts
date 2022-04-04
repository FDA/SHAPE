import React from 'react';
import {QuestionnaireQuestion} from './DataTypes';

export interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

export interface EditSaveCancelButtonProps {
    edit: Function;
    save: Function;
    cancel: Function;
    archive: Function;
    editing: boolean;
    participantId?: string;
    locked?: boolean;
}

export interface QuestionnaireQuestionComponent extends QuestionnaireQuestion {
    id?: string;
    editing?: boolean;
}
