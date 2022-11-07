import { ReactNode } from 'react';
import QuestionFactory from '../factory/QuestionFactory';
import { Questionnaire } from '../interfaces';
import { Context } from './Context';
import RuleFactory from '../factory/RuleFactory';
import ValidationFactory from '../factory/ValidationFactory';
import { QuestionnaireQuestion } from '../../interfaces/DataTypes';

export class QuestionEngine {
    private _questions: QuestionnaireQuestion[] = [];
    private _currentQuestion = 0;
    private _eventChangeHandler: Function;
    private _clearValue: Function;
    private _currentAnswerValue: Function;
    private questionFactory: QuestionFactory = new QuestionFactory();
    private ruleFactory: RuleFactory = new RuleFactory();
    private validationFactory: ValidationFactory = new ValidationFactory();
    private _context: Context = new Context(
        '',
        '',
        '',
        { participantId: '', name: '', dob: '', gender: '', id: '' },
        '',
        ''
    );

    /*
     * Returns the question engine which renders ReactNodes based on JSON objects passed
     * model:questionnaire is an array of @question interfaces
     * eventChangeHandler is the event handler in the React parent that will be called onChange
     * for wrapped components
     *
     * */
    constructor(
        model: Questionnaire,
        eventChangeHandler: Function,
        clearValue: Function,
        currentAnswerValue: Function
    ) {
        this._eventChangeHandler = eventChangeHandler;
        this._clearValue = clearValue;
        this._currentAnswerValue = currentAnswerValue;
        this._questions = [...model.questions];
        this._currentQuestion = 0;
    }

    public getQuestionTitle(name: string): string {
        const question = this._questions.filter((q) => q.name === name);
        return question[0].title;
    }

    public goToFirst() {
        this._currentQuestion = 0;
    }

    /*
     * Returns the next question object in the stack as a rendered
     * ReactNode with the value provided, state is maintained externally
     *
     */
    public nextQuestion(defaultValue: string): ReactNode {
        let idx = this._currentQuestion;
        idx++;
        if (idx >= this._questions.length) {
            idx = this._questions.length;
        }
        this._currentQuestion = idx;
        return this.getCurrentQuestion(defaultValue);
    }

    /* Returns the next question object as a JSON object */
    public peekNextQuestion(): QuestionnaireQuestion {
        // Returns the metadata of the next object
        let idx = this._currentQuestion;
        idx++;
        if (idx >= this._questions.length) {
            idx = this._questions.length;
        }
        return this._questions[idx];
    }

    /* Returns the previous question object as a JSON object */
    public peekPreviousQuestion(): QuestionnaireQuestion {
        // Returns the metadata of the previous object
        let idx = this._currentQuestion;
        idx--;
        if (idx <= 0) {
            idx = 0;
        }
        return this._questions[idx];
    }

    /* Returns the current question object as a JSON object */
    public peekCurrentQuestion(): QuestionnaireQuestion {
        return this._questions[this._currentQuestion];
    }

    /*
     * Returns the previous question object in the stack as a rendered
     * ReactNode with the value provided, state is maintained externally
     *
     */
    previousQuestion(defaultValue: string): ReactNode {
        let idx = this._currentQuestion;
        idx--;
        if (idx <= 0) {
            idx = 0;
        }
        this._currentQuestion = idx;
        return this.getCurrentQuestion(defaultValue);
    }

    /*
     * Returns the current question object in the stack as a rendered
     * ReactNode with the value provided, state is maintained externally
     *
     */
    public getCurrentQuestion(defaultValue: string): ReactNode {
        const q = this._questions[this._currentQuestion];
        const { questionFactory } = this;
        return questionFactory.renderQuestion(
            q,
            this._eventChangeHandler,
            defaultValue,
            this._clearValue,
            this._currentAnswerValue
        );
    }

    /*
     * Takes the current value and runs it through all rule factories
     * Returns a question name to skip to or undefined if no action is
     * needed
     */
    public shouldSkip(currentValue: string): string | undefined {
        const q = this._questions[this._currentQuestion];
        const { rules } = q;
        if (!rules) {
            return undefined;
        }
        const { ruleFactory } = this;
        return ruleFactory.evaluateRules(q, currentValue, this._context);
    }

    /*
     * Validate the answer semantic value.  Runs through the validaition factories
     * Returns true if is valid, false if not
     */
    public isValid(currentValue: string): boolean | undefined {
        const q = this._questions[this._currentQuestion];
        const { validationFactory } = this;
        return validationFactory.validate(q, currentValue);
    }

    public getCurrentMessage(): string {
        const q = this._questions[this._currentQuestion];
        let retVal = '';
        if (q.type === 'range') {
            retVal = `Value should be between ${q.min} and ${q.max}.`;
        } else {
            retVal = q.requiredMessage ? q.requiredMessage : 'This question is required.';
        }
        return retVal;
    }

    public setNextQuestion(questionName: string) {
        const idx = this._questions
            .map(function (q) {
                return q.name;
            })
            .indexOf(questionName);
        if (idx > -1) {
            this._currentQuestion = idx;
        }
    }

    /* Returns current question index */
    public getCurrentIndex(): number {
        return this._currentQuestion + 1;
    }

    /* Returns question array length */
    public getQuestionsLen(): number {
        return this._questions.length;
    }

    /* Returns boolean, is there a next question in the stack */
    get hasNext(): boolean {
        const idx = this._currentQuestion;
        return idx + 1 < this._questions.length;
    }

    /* Returns boolean, is there a previous question in the stack */
    get hasPrevious(): boolean {
        const idx = this._currentQuestion;
        return idx - 1 >= 0;
    }

    /* Returns all question JSON objects */
    get questions(): QuestionnaireQuestion[] | undefined {
        return this._questions;
    }

    get context(): Context {
        return this._context;
    }

    set context(value: Context) {
        this._context = value;
    }
}

export default QuestionEngine;
