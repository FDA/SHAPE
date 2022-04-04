import {
    IonList,
    IonButton,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonListHeader,
    IonCol,
    IonSearchbar,
    IonCard,
    IonCardContent,
    IonAlert
} from '@ionic/react';
import {isEmptyObject, guid} from '../utils/Utils';
import React, {Component} from 'react';
import {
    getQuestionTemplates,
    editQuestionTemplate,
    deleteQuestionTemplate,
    storeImage
} from '../utils/API';
import QuestionCard from './QuestionCard/QuestionCard';
import {connect} from 'react-redux';
import {updateQuestionnaire} from '../redux/actions/Questionnaire';
import {withRouter, RouteComponentProps} from 'react-router-dom';
import {
    Questionnaire,
    QuestionChoice,
    InfoCardImageSection
} from '../interfaces/DataTypes';
import {QuestionnaireQuestionComponent} from '../interfaces/Components';
import {cloneDeep} from 'lodash';
import {questionTypes, sectionTypes} from '../utils/Constants';

interface ReduxProps extends RouteComponentProps {
    questionnaire: Questionnaire;
    updateQuestionnaireDispatch: Function;
}

interface State {
    questionList: Array<QuestionnaireQuestionComponent>;
    checkedList: Array<QuestionnaireQuestionComponent>;
    searchText: string;
    finalSearchText: string;
    showDeleteAlert: boolean;
    questionId: string;
}

class AddSearch extends Component<ReduxProps, State> {
    constructor(props: ReduxProps) {
        super(props);
        this.state = {
            questionList: [],
            checkedList: [],
            searchText: '',
            finalSearchText: '',
            showDeleteAlert: false,
            questionId: ''
        };
    }

    handleChange = (e: any, question: QuestionnaireQuestionComponent) => {
        let tempList = this.state.checkedList;
        if (e.target.checked) {
            tempList.push(question);
        } else {
            tempList = tempList.filter(
                (elem: QuestionnaireQuestionComponent) => {
                    return elem.id !== question.id;
                }
            );
        }
        this.setState({checkedList: tempList});
    };

    add = () => {
        let {questionnaire} = this.props;
        let questionnaireId = questionnaire.id;
        let questions = !isEmptyObject(questionnaire.questions)
            ? cloneDeep(questionnaire.questions)
            : [];

        let updatedQuestionList = this.state.checkedList;

        let l = questions.length;

        for (let index in updatedQuestionList) {
            let newQuestion = updatedQuestionList[index];
            newQuestion.order = l + parseInt(index);
            newQuestion.name = guid();
            delete newQuestion.id;
            questions.push(newQuestion);
        }

        questionnaire.questions = questions;

        this.props.updateQuestionnaireDispatch(questionnaireId, questionnaire);
        this.props.history.goBack();
    };

    cancel = (id: string) => {
        this.setState({
            questionList: this.state.questionList.map(
                (elem: QuestionnaireQuestionComponent) => {
                    if (elem.id === id) {
                        elem.editing = false;
                        return elem;
                    } else return elem;
                }
            )
        });
    };

    saveEditedRow = (id: string) => {
        let promises: Promise<any>[] = [];

        let question = {
            ...this.state.questionList.find(
                (elem: QuestionnaireQuestionComponent) => {
                    return elem.id === id;
                }
            )
        };

        if (question.type === questionTypes.INFO) {
            let {sections} = question;
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
        }
        Promise.all(promises)
            .then(() => editQuestionTemplate(question))
            .then(() => this.cancel(id))
            .catch((err: any) => {
                console.error(err);
            });
    };

    editRow = (id: string) => {
        this.setState({
            questionList: this.state.questionList.map(
                (elem: QuestionnaireQuestionComponent) => {
                    if (elem.id === id) {
                        elem.editing = true;
                        return elem;
                    } else return elem;
                }
            )
        });
    };

    handleRowChange = (e: any, id: string) => {
        const {name, value} = e.target;
        this.setState({
            questionList: this.state.questionList.map(
                (elem: QuestionnaireQuestionComponent) => {
                    if (elem.id === id) {
                        //@ts-ignore
                        elem[name] = value;
                        return elem;
                    } else return elem;
                }
            )
        });
    };

    handleOptionChange = (e: any, id: string) => {
        const {name, value} = e.target;
        let {questionList} = this.state;
        this.setState({
            questionList: questionList.map(
                (elem: QuestionnaireQuestionComponent) => {
                    if (elem.id === id) {
                        //@ts-ignore
                        elem.options[name] = value;
                        //@ts-ignore
                        return elem.options[name];
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
                if (elem.id === id) {
                    elem.choices = elem.choices.filter(
                        (choice: QuestionChoice) => {
                            return choice.index !== choiceId;
                        }
                    );
                }
                return elem;
            }
        );

        this.setState({
            questionList: QL
        });
    };

    handleSectionChange = (sections: any, id: string) => {
        let questionList = this.state.questionList.map(
            (elem: QuestionnaireQuestionComponent) => {
                if (elem.id === id) {
                    elem.sections = sections;
                    return elem;
                } else return elem;
            }
        );
        this.setState({questionList: questionList});
    };

    deleteRow = (questionId: string) => {
        this.setState({showDeleteAlert: true, questionId: questionId});
    };

    handleSearchChange = (text: string) => {
        this.setState({searchText: text});
    };

    finalSearch = () => {
        let searchText = this.state.searchText;
        this.setState({finalSearchText: searchText});
    };

    clear = () => {
        this.setState({searchText: '', finalSearchText: ''});
    };

    load = () => {
        this.setState({
            questionList: [],
            checkedList: []
        });
        let questionList: QuestionnaireQuestionComponent[] = [];

        getQuestionTemplates()
            .then((snapshot: any) => {
                snapshot.forEach((doc: any) => {
                    let question = doc.data;
                    question.id = doc.id;
                    question.editing = false;
                    questionList.push(question);
                });

                this.setState({questionList: questionList});
            })
            .catch((err: any) => {
                console.error('Error getting documents', err);
            });
    };

    componentDidMount() {
        this.load();
    }

    render() {
        let {
            questionList,
            searchText,
            finalSearchText,
            showDeleteAlert,
            questionId
        } = this.state;

        return (
            <>
                <IonHeader>
                    <IonToolbar>
                        <IonList>
                            <IonListHeader>
                                <IonCol size="3">
                                    <IonTitle>
                                        Search and Add Questions
                                    </IonTitle>
                                </IonCol>
                                <IonCol size="5">
                                    <IonSearchbar
                                        value={searchText}
                                        onIonChange={(e: any) =>
                                            this.handleSearchChange(
                                                e.detail.value!
                                            )
                                        }></IonSearchbar>
                                </IonCol>
                                <IonCol size="1">
                                    <IonButton
                                        onClick={() => this.finalSearch()}>
                                        Search
                                    </IonButton>
                                </IonCol>
                                <IonCol size="1">
                                    <IonButton
                                        onClick={() => this.clear()}
                                        color="secondary">
                                        Clear
                                    </IonButton>
                                </IonCol>
                                <IonCol size="2">
                                    <IonButton
                                        fill="solid"
                                        onClick={() => this.add()}>
                                        Add Question(s)
                                    </IonButton>
                                </IonCol>
                            </IonListHeader>
                        </IonList>
                    </IonToolbar>
                </IonHeader>
                <IonList>
                    {isEmptyObject(finalSearchText) && (
                        <IonCard style={{textAlign: 'center'}}>
                            <IonCardContent>
                                Search to populate questions.
                            </IonCardContent>
                        </IonCard>
                    )}
                    {!isEmptyObject(finalSearchText) &&
                        questionList
                            .filter((elem: QuestionnaireQuestionComponent) => {
                                return elem.title
                                    .toLowerCase()
                                    .includes(finalSearchText.toLowerCase());
                            })
                            .map((question: QuestionnaireQuestionComponent) => {
                                return (
                                    <QuestionCard
                                        key={question.id}
                                        question={question}
                                        handleChange={this.handleChange}
                                        saveEditedRow={this.saveEditedRow}
                                        deleteRow={this.deleteRow}
                                        editRow={this.editRow}
                                        cancel={this.cancel}
                                        handleRowChange={this.handleRowChange}
                                        handleChoiceChange={
                                            this.handleChoiceChange
                                        }
                                        handleChoiceDelete={
                                            this.handleChoiceDelete
                                        }
                                        handleOptionChange={
                                            this.handleOptionChange
                                        }
                                        handleSectionChange={
                                            this.handleSectionChange
                                        }
                                    />
                                );
                            })}
                </IonList>
                <IonAlert
                    isOpen={showDeleteAlert}
                    onDidDismiss={() => {
                        this.setState({showDeleteAlert: false});
                    }}
                    header={'Delete'}
                    message={`Are you sure you want to permanently delete this question template?`}
                    buttons={[
                        {
                            text: 'Cancel',
                            role: 'cancel',
                            cssClass: 'secondary'
                        },
                        {
                            text: 'Yes',
                            handler: () => {
                                deleteQuestionTemplate(questionId)
                                    .then(() => {
                                        this.setState({
                                            questionList: questionList.filter(
                                                (
                                                    question: QuestionnaireQuestionComponent
                                                ) => {
                                                    return (
                                                        question.id !==
                                                        questionId
                                                    );
                                                }
                                            )
                                        });
                                    })
                                    .catch((err: any) => {
                                        console.error(err);
                                    });
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
            questionnaire: any
        ) {
            dispatch(updateQuestionnaire(questionnaireId, questionnaire));
        }
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withRouter(AddSearch));
