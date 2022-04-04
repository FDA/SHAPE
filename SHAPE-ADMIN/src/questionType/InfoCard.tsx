import {IonButton, IonText, IonGrid, IonCol, IonRow} from '@ionic/react';
import React from 'react';
import {guid, isEmptyObject} from '../utils/Utils';
import {RouteComponentProps, withRouter} from 'react-router-dom';
import {
    Question,
    QuestionnaireQuestion,
    Questionnaire
} from '../interfaces/DataTypes';
import {createQuestionTemplate, storeImage} from '../utils/API';
import {routes, sectionTypes, questionTypes} from '../utils/Constants';
import {updateQuestionnaire} from '../redux/actions/Questionnaire';
import {connect} from 'react-redux';
import {withStyles} from '@material-ui/core/styles';
import InfoCardPalette from './InfoCardComponents/InfoCardPalette';
import InfoCardDisplay from './InfoCardComponents/InfoCardDisplay';

interface InfoCardState {
    sections: Array<any>;
    failure: boolean;
    variable: string;
}

interface ReduxProps extends RouteComponentProps {
    questionnaire: Questionnaire;
    updateQuestionnaireDispatch: Function;
    loggedIn: boolean;
}

const styles = () => ({
    maxWidth: {
        width: '100%'
    }
});

class InfoCard extends React.Component<ReduxProps, InfoCardState> {
    constructor(props: ReduxProps) {
        super(props);
        this.state = {
            variable: '',
            sections: [],
            failure: false
        };
    }

    componentDidMount() {
        const {loggedIn} = this.props;

        if (!loggedIn) {
            this.props.history.push(routes.LOGIN);
        }
    }

    handleVariableChange = (e: any) => {
        this.setState({variable: e.target.value});
    };

    addSection = (newSectionObject: any) => {
        let {sections} = this.state;
        sections.push(newSectionObject);
        this.setState({sections: sections});
    };

    storeSection = (index: number, updatedSectionObject: any) => {
        let {sections} = this.state;
        sections[index] = updatedSectionObject;
        this.setState({sections: sections});
    };

    storeSections = (sections: any) => {
        this.setState({sections: sections});
    };

    removeSection = (index: number) => {
        let {sections} = this.state;
        sections.splice(index, 1);
        this.setState({sections: sections});
    };

    createPromises = (sections: any) => {
        let promises: Promise<any>[] = [];
        for (let index in sections) {
            let section = sections[index];
            if (section.type === sectionTypes.IMAGE) {
                let split = section.value.split(',');
                if (split.length > 1) {
                    let base64String = split[1];
                    let id = guid();
                    section.value = id;
                    promises.push(
                        storeImage({
                            id: id,
                            fileName: section.fileName,
                            data: base64String
                        })
                    );
                }
            }
        }
        return promises;
    };

    submit = async () => {
        let {sections, variable} = this.state;
        let promises: Promise<any>[] = [];

        if (!isEmptyObject(sections) && !isEmptyObject(variable)) {
            promises = this.createPromises(sections);

            Promise.all(promises)
                .then(() => {
                    let question = {
                        type: questionTypes.INFO,
                        title: questionTypes.INFO,
                        variable: variable,
                        sections: sections
                    };

                    createQuestionTemplate(question)
                        .then(() => {
                            this.setState({
                                sections: [],
                                variable: ''
                            });
                        })
                        .catch((err: any) => {
                            console.error(err);
                        });
                })
                .catch((err: any) => {
                    console.error(err);
                });
        } else {
            this.setState({failure: true});
        }
    };

    submitAndAdd = () => {
        let {sections, variable} = this.state;
        let {questionnaire} = this.props;
        let questionnaireId = questionnaire.id;
        let promises: Promise<any>[] = [];

        if (!isEmptyObject(sections) && !isEmptyObject(variable)) {
            promises = this.createPromises(sections);
            Promise.all(promises)
                .then(() => {
                    let question: Question = {
                        type: questionTypes.INFO,
                        title: questionTypes.INFO,
                        variable: variable,
                        sections: sections
                    };

                    createQuestionTemplate(question)
                        .then(() => {
                            let tempQuestionnaire = questionnaire;
                            if (isEmptyObject(tempQuestionnaire.questions)) {
                                tempQuestionnaire.questions = [];
                            }
                            let questionnaireQuestion: QuestionnaireQuestion = {
                                ...question,
                                order: tempQuestionnaire.questions.length,
                                name: guid()
                            };
                            tempQuestionnaire.questions.push(
                                questionnaireQuestion
                            );
                            this.props.updateQuestionnaireDispatch(
                                questionnaireId,
                                tempQuestionnaire
                            );
                            this.props.history.goBack();
                        })
                        .catch((err: any) => {
                            console.error(err);
                        });
                })
                .catch((err: any) => {
                    console.error(err);
                });
        } else {
            this.setState({failure: true});
        }
    };

    render() {
        let {sections, variable} = this.state;

        return (
            <>
                <form>
                    <IonGrid className="maxWidth">
                        <IonRow>
                            <IonCol size="6">
                                <InfoCardPalette
                                    editing={true}
                                    sections={sections}
                                    variable={variable}
                                    handleVariableChange={
                                        this.handleVariableChange
                                    }
                                    addSection={this.addSection}
                                    storeSection={this.storeSection}
                                    storeSections={this.storeSections}
                                    removeSection={this.removeSection}
                                />
                            </IonCol>
                            <IonCol size="6">
                                <InfoCardDisplay sections={sections} />
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                    <IonButton
                        size="small"
                        fill="outline"
                        onClick={this.submit}>
                        Create
                    </IonButton>
                    <IonButton
                        size="small"
                        fill="outline"
                        color="secondary"
                        onClick={this.submitAndAdd}>
                        Create and add to this Questionnaire
                    </IonButton>
                    {this.state.failure && (
                        <IonText color="danger">
                            All required fields are not filled.
                        </IonText>
                    )}
                </form>
            </>
        );
    }
}

function mapStateToProps(state: any) {
    return {
        questionnaire: state.questionnaire,
        loggedIn: state.authentication.loggedIn
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
)(withStyles(styles)(withRouter(InfoCard)));
