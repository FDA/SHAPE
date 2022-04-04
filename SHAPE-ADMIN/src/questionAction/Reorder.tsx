import {
    IonButton,
    IonList,
    IonReorderGroup,
    IonCard,
    IonCardContent,
    IonRow,
    IonCol,
    IonText,
    IonAlert
} from '@ionic/react';
import {connect} from 'react-redux';
import {ItemReorderEventDetail} from '@ionic/core';
import {isEmptyObject, guid} from '../utils/Utils';
import {QuestionnaireQuestionComponent} from '../interfaces/Components';
import {
    QuestionRule,
    QuestionChoice,
    Questionnaire,
    InfoCardImageSection
} from '../interfaces/DataTypes';
import React, {Component} from 'react';
import QuestionCard from './QuestionCard/QuestionCard';
import {updateQuestionnaire} from '../redux/actions/Questionnaire';
import {editQuestionnaire, storeImage} from '../utils/API';
import {cloneDeep, differenceBy} from 'lodash';
import LoadingScreen from '../layout/LoadingScreen';
import {questionTypes, sectionTypes} from '../utils/Constants';
const arrayMove = require('array-move');

interface ReduxProps {
    questionnaire: Questionnaire;
    updateQuestionnaireDispatch: Function;
}

interface State {
    success: boolean;
    questionList: Array<QuestionnaireQuestionComponent>;
    reorder: boolean;
    editing: boolean;
    sorting: boolean;
    showDeleteAlert: boolean;
    isLoading: boolean;
    questionId: string;
    error: boolean;
}

class Reorder extends Component<ReduxProps, State> {
    constructor(props: ReduxProps) {
        super(props);
        this.state = {
            success: false,
            questionList: [],
            reorder: false,
            editing: false,
            sorting: false,
            showDeleteAlert: false,
            isLoading: false,
            questionId: null,
            error: false
        };
    }

    componentDidMount() {
        this.setState({isLoading: true});
        this.load();
    }

    processQuestionnaireQuestionComponent = (
        elem: QuestionnaireQuestionComponent
    ) => {
        delete elem.editing;
        elem.required =
            elem.required === undefined || elem.required === null
                ? false
                : elem.required;
        if (
            elem.requiredMessage === undefined ||
            elem.requiredMessage === null
        ) {
            delete elem.requiredMessage;
        }
        return elem;
    };

    // save without updating state so that reorder works
    save = () => {
        let {questionnaire} = this.props;
        let questionnaireId = questionnaire.id;
        let {questionList} = this.state;

        questionnaire.questions = questionList.map(
            (elem: QuestionnaireQuestionComponent) => {
                return this.processQuestionnaireQuestionComponent(elem);
            }
        );

        if (!questionnaireId) {
            return new Promise((resolve, reject) => {
                console.trace();
                reject('Error: Attempted to save questionnaire without ID.');
            });
        }

        return editQuestionnaire(questionnaireId, questionnaire);
    };

    doReorder = (event: CustomEvent<ItemReorderEventDetail>) => {
        event.stopPropagation();
        let questionList = this.state.questionList;
        questionList = arrayMove(
            questionList,
            event.detail.from,
            event.detail.to
        );
        questionList = questionList.map(
            (question: QuestionnaireQuestionComponent, index: number) => {
                question.order = index;
                return question;
            }
        );
        this.setState({questionList: questionList});
        event.detail.complete();
    };

    cancel = (id: string) => {
        let questionnaire = cloneDeep(this.props.questionnaire);
        let questionList = cloneDeep(this.state.questionList);

        let canceledQuestion = questionnaire.questions.find(
            (elem: QuestionnaireQuestionComponent) => {
                return elem.name === id;
            }
        );

        questionList = questionList.map(
            (elem: QuestionnaireQuestionComponent) => {
                if (elem.name === id) {
                    return canceledQuestion;
                } else return elem;
            }
        );

        let checkEditing = questionList.filter(
            (elem: QuestionnaireQuestionComponent) => {
                return elem.editing === true;
            }
        );
        let editing = checkEditing.length > 0;

        this.setState({questionList: questionList, editing: editing});
    };

    // called when delete button is clicked on question card
    deleteRow = (questionId: string) => {
        this.setState({showDeleteAlert: true, questionId: questionId});
    };

    // called when user clicks "yes" on showDeleteAlert
    deleteQuestion = () => {
        let questionnaire = cloneDeep(this.props.questionnaire);
        let questionList = cloneDeep(this.state.questionList);
        let questionnaireId = questionnaire.id;
        let {questionId} = this.state;

        questionList = questionList.filter(
            (elem: QuestionnaireQuestionComponent) => {
                return elem.name !== questionId;
            }
        );

        questionList = questionList.map(
            (elem: QuestionnaireQuestionComponent, index: number) => {
                elem.order = index;
                return elem;
            }
        );

        questionnaire.questions = questionnaire.questions.filter(
            (elem: QuestionnaireQuestionComponent) => {
                return elem.name !== questionId;
            }
        );

        questionnaire.questions = questionnaire.questions.map(
            (elem: QuestionnaireQuestionComponent, index: number) => {
                elem.order = index;
                return elem;
            }
        );

        let checkEditing = questionList.filter(
            (elem: QuestionnaireQuestionComponent) => {
                return elem.editing === true;
            }
        );
        let editing = checkEditing.length > 0;

        this.setState({questionList: questionList, editing: editing});
        this.props.updateQuestionnaireDispatch(questionnaireId, questionnaire);
    };

    processInfo = (elem: QuestionnaireQuestionComponent) => {
        let {sections} = elem;
        let promises: Promise<any>[] = [];
        for (let key in sections) {
            let section = sections[key] as InfoCardImageSection;
            if (section.type === sectionTypes.IMAGE) {
                let split = section.value.split(',');
                if (split.length > 1) {
                    let base64String = split[1];
                    let uid = guid();
                    section.value = uid;
                    promises.push(
                        storeImage({
                            id: uid,
                            fileName: section.fileName,
                            data: base64String
                        })
                    );
                }
            }
        }
        return promises;
    };

    saveEditedRow = (id: string) => {
        let questionnaire = cloneDeep(this.props.questionnaire);
        let questionList = cloneDeep(this.state.questionList);
        let questionnaireId = questionnaire.id;
        let promises: Promise<any>[] = [];

        questionList = questionList.map(
            (elem: QuestionnaireQuestionComponent) => {
                if (elem.name === id) {
                    elem.editing = false;
                    if (elem.type === questionTypes.INFO) {
                        promises = this.processInfo(elem);
                    }
                    return elem;
                } else return elem;
            }
        );

        let editedQuestion = questionList.find(
            (elem: QuestionnaireQuestionComponent) => {
                return elem.name === id;
            }
        );

        questionnaire.questions = questionnaire.questions.map(
            (elem: QuestionnaireQuestionComponent) => {
                if (elem.name === id) {
                    return editedQuestion;
                } else return elem;
            }
        );

        Promise.all(promises).then(() => {
            let checkEditing = questionList.filter(
                (elem: QuestionnaireQuestionComponent) => {
                    return elem.editing === true;
                }
            );
            let editing = checkEditing.length > 0;

            questionnaire.questions = questionnaire.questions.map(
                (elem: QuestionnaireQuestionComponent) => {
                    return this.processQuestionnaireQuestionComponent(elem);
                }
            );

            this.setState({questionList: questionList, editing: editing});
            this.props.updateQuestionnaireDispatch(
                questionnaireId,
                questionnaire
            );
        });
    };

    // Save rule in dialogue to firebase without exiting edit state
    saveRule = () => {
        let questionnaire = cloneDeep(this.props.questionnaire);
        let questionnaireId = questionnaire.id;
        questionnaire.questions = this.state.questionList;
        this.props.updateQuestionnaireDispatch(questionnaireId, questionnaire);
    };

    editRow = (id: string) => {
        let questionList = cloneDeep(this.state.questionList);
        questionList = questionList.map(
            (elem: QuestionnaireQuestionComponent) => {
                if (elem.name === id) {
                    elem.editing = true;
                    return elem;
                } else return elem;
            }
        );
        this.setState({questionList: questionList, editing: true});
    };

    handleSectionChange = (sections: any, id: string) => {
        let questionList = this.state.questionList.map(
            (elem: QuestionnaireQuestionComponent) => {
                if (elem.name === id) {
                    elem.sections = sections;
                    return elem;
                } else return elem;
            }
        );
        this.setState({questionList: questionList});
    };

    handleRowChange = (e: any, id: string) => {
        const {name, value} = e.target;
        let questionList = this.state.questionList.map(
            (elem: QuestionnaireQuestionComponent) => {
                if (elem.name === id) {
                    if (name === 'required') {
                        const {checked} = e.target;
                        //@ts-ignore
                        elem[name] = checked;
                    } else {
                        //@ts-ignore
                        elem[name] = value;
                    }
                    return elem;
                } else return elem;
            }
        );
        this.setState({questionList: questionList});
    };

    handleRuleChange = (rules: Array<QuestionRule>, id: string) => {
        this.setState({
            questionList: this.state.questionList.map(
                (elem: QuestionnaireQuestionComponent) => {
                    if (elem.name === id) {
                        elem.rules = rules;
                        return elem;
                    } else return elem;
                }
            )
        });
    };

    handleChoiceChange = (e: any, id: string) => {
        const {name, value} = e.target;
        let questionList = cloneDeep(this.state.questionList);

        questionList = questionList.map(
            (elem: QuestionnaireQuestionComponent) => {
                const nameArr = name.split('-');
                const type = nameArr[0];
                const order = parseInt(nameArr[1]);
                if (elem.name === id) {
                    if (type === 'value') {
                        elem.choices = elem.choices.map(
                            (choice: QuestionChoice) => {
                                if (choice.order === order) {
                                    choice.value = value;
                                }
                                return choice;
                            }
                        );
                    } else if (type === 'text') {
                        //type is text
                        elem.choices = elem.choices.map(
                            (choice: QuestionChoice) => {
                                if (choice.order === order) {
                                    choice.text = value;
                                }
                                return choice;
                            }
                        );
                    }
                }
                return elem;
            }
        );

        this.setState({questionList: questionList});
    };

    handleChoiceDelete = (id: string, choiceId: string) => {
        let QL = this.state.questionList.map(
            (elem: QuestionnaireQuestionComponent) => {
                if (elem.name === id) {
                    elem.choices = elem.choices
                        .filter((choice: QuestionChoice) => {
                            return choice.index !== choiceId;
                        })
                        .map((choice: QuestionChoice, index: number) => {
                            choice.order = index;
                            return choice;
                        });
                }
                return elem;
            }
        );

        this.setState({
            questionList: QL
        });
    };

    handleOptionChange = (e: any, id: string) => {
        const {name, value} = e.target;
        let {questionList} = this.state;
        this.setState({
            questionList: questionList.map(
                (elem: QuestionnaireQuestionComponent) => {
                    if (elem.name === id) {
                        //@ts-ignore
                        elem.options[name] = value;
                        //@ts-ignore
                        return elem;
                    } else return elem;
                }
            )
        });
    };

    reorder = () => {
        this.setState({reorder: !this.state.reorder});
    };

    saveOrder = () => {
        this.save()
            .then(() => {
                this.setState({reorder: !this.state.reorder});
            })
            .catch((e: any) => console.error(e));
    };

    load = () => {
        const parent = this;
        let {questionnaire} = this.props;
        if (!isEmptyObject(questionnaire.questions)) {
            let questionList = cloneDeep(questionnaire.questions);
            this.setState({
                questionList: questionList
            });
        }
        setTimeout(function () {
            parent.setState({isLoading: false, error: false});
        }, 500);
    };

    UNSAFE_componentWillReceiveProps(props: ReduxProps) {
        const parent = this;
        let {editing} = this.state;
        let nextQuestionList = cloneDeep(props.questionnaire.questions);
        let questionList = cloneDeep(this.state.questionList);

        let differences: QuestionnaireQuestionComponent[] = differenceBy(
            nextQuestionList,
            questionList,
            'name'
        );

        let newQuestions: QuestionnaireQuestionComponent[] = differences.filter(
            (elem: QuestionnaireQuestionComponent) => {
                return nextQuestionList.includes(elem);
            }
        );
        let shouldUpdate = newQuestions.length > 0;

        if (!editing) {
            this.setState({questionList: nextQuestionList});
            setTimeout(() => {
                parent.setState({isLoading: false, error: false});
            }, 1000);
        } else if (editing && shouldUpdate) {
            questionList = questionList.concat(newQuestions);

            questionList = questionList.map(
                (elem: QuestionnaireQuestionComponent, index: number) => {
                    elem.order = index;
                    return elem;
                }
            );

            let checkEditing = questionList.filter(
                (elem: QuestionnaireQuestionComponent) => {
                    return elem.editing === true;
                }
            );
            let stillEditing = checkEditing.length > 0;

            this.setState({questionList: questionList, editing: stillEditing});
            setTimeout(() => {
                parent.setState({isLoading: false, error: false});
            }, 1000);
        }
    }

    render() {
        let {
            questionList,
            reorder,
            editing,
            isLoading,
            error,
            showDeleteAlert
        } = this.state;
        let {questionnaire} = this.props;
        let locked = !isEmptyObject(questionnaire.locked)
            ? questionnaire.locked
            : false;

        questionList.sort(
            (
                a: QuestionnaireQuestionComponent,
                b: QuestionnaireQuestionComponent
            ) => (a.order > b.order ? 1 : -1)
        );

        return (
            <>
                {locked && <></>}
                {!reorder && !locked && (
                    <IonButton
                        disabled={editing}
                        onClick={() => {
                            this.reorder();
                        }}>
                        Edit Order
                    </IonButton>
                )}
                {reorder && !locked && (
                    <IonButton
                        onClick={() => {
                            this.saveOrder();
                        }}>
                        Save Order
                    </IonButton>
                )}
                {isLoading && (
                    <IonRow text-center>
                        <IonCol size="12" style={{textAlign: 'center'}}>
                            <LoadingScreen />
                        </IonCol>
                    </IonRow>
                )}
                {error && (
                    <IonCard style={{textAlign: 'center'}}>
                        <IonCardContent>
                            <IonText color="danger">
                                Error loading questions. Try refreshing.
                            </IonText>
                        </IonCardContent>
                    </IonCard>
                )}
                {isEmptyObject(questionList) && (
                    <IonCard style={{textAlign: 'center'}}>
                        <IonCardContent>
                            No questions have been added.
                        </IonCardContent>
                    </IonCard>
                )}
                <IonList lines="none">
                    <IonReorderGroup
                        disabled={!reorder}
                        onIonItemReorder={this.doReorder}>
                        {questionList.map(
                            (question: QuestionnaireQuestionComponent) => {
                                return (
                                    <QuestionCard
                                        key={question.name}
                                        question={question}
                                        saveEditedRow={this.saveEditedRow}
                                        saveRule={this.saveRule}
                                        deleteRow={this.deleteRow}
                                        cancel={this.cancel}
                                        editRow={this.editRow}
                                        handleRowChange={this.handleRowChange}
                                        handleChoiceChange={
                                            this.handleChoiceChange
                                        }
                                        handleSectionChange={
                                            this.handleSectionChange
                                        }
                                        handleOptionChange={
                                            this.handleOptionChange
                                        }
                                        questionList={questionList}
                                        handleRuleChange={this.handleRuleChange}
                                        reorder={reorder}
                                        locked={locked}
                                        handleChoiceDelete={
                                            this.handleChoiceDelete
                                        }
                                    />
                                );
                            }
                        )}
                    </IonReorderGroup>
                </IonList>

                <IonAlert
                    isOpen={showDeleteAlert}
                    onDidDismiss={() => {
                        this.setState({showDeleteAlert: false});
                    }}
                    header={'Delete'}
                    message={`Are you sure you want to permanently delete this question?`}
                    buttons={[
                        {
                            text: 'Cancel',
                            role: 'cancel',
                            cssClass: 'secondary'
                        },
                        {
                            text: 'Yes',
                            handler: () => {
                                this.deleteQuestion();
                            }
                        }
                    ]}
                />
            </>
        );
    }
}

function mapStateToProps(state: any) {
    return {
        questionnaire: state.questionnaire
    };
}

function mapDispatchToProps(dispatch: any) {
    return {
        updateQuestionnaireDispatch(
            questionnaireId: string,
            questionnaire: Questionnaire
        ) {
            dispatch(updateQuestionnaire(questionnaireId, questionnaire));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Reorder);
