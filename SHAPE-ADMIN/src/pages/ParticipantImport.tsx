import {IonButton, IonLabel, IonRow} from '@ionic/react';
import React from 'react';
import {createParticipant, getAllParticipants} from '../utils/API';
import {isEmptyObject} from '../utils/Utils';
import {connect} from 'react-redux';
import {updateSurvey} from '../redux/actions/Survey';
import {Survey, Participant} from '../interfaces/DataTypes';

interface ReduxProps {
    survey: Survey;
    updateSurveyDispatch: Function;
}

interface State {
    error: boolean;
    emptyIdsError: boolean;
    emptyFileError: boolean;
    duplicateError: boolean;
    duplicateParticipants: Array<string>;
    success: boolean;
    successParticipants: Array<string>;
    warning: boolean;
    warningParticipants: Array<string>;
    formatError: boolean;
    errorParticipants: Array<string>;
}

class ParticipantImport extends React.Component<ReduxProps, State> {
    constructor(props: ReduxProps) {
        super(props);
        this.state = {
            error: false,
            emptyIdsError: false,
            emptyFileError: false,
            duplicateError: false,
            duplicateParticipants: [],
            success: false,
            successParticipants: [],
            warning: false,
            warningParticipants: [],
            formatError: false,
            errorParticipants: []
        };
    }

    //convert json data to Array of Participant types
    JSONtoParticipants = (docs: Array<Object>) => {
        let participants: Array<Participant> = [];

        docs.forEach((obj: any) => {
            let participant: Participant = {
                participantId: obj.registration_code,
                securityQuestions: [
                    {
                        question: obj.security_question_1,
                        answer: obj.sq_1_answer
                    },
                    {
                        question: obj.security_question_2,
                        answer: obj.sq_2_answer
                    },
                    {
                        question: obj.security_question_3,
                        answer: obj.sq_3_answer
                    }
                ],
                public: true
            };
            participants.push(participant);
        });
        return participants;
    };

    clearFileSelection = () => {
        (document.getElementById(
            'participant-file-upload'
        ) as HTMLInputElement).value = '';
    };

    resetErrorState = () => {
        this.setState({
            error: false,
            emptyIdsError: false,
            emptyFileError: false,
            duplicateError: false,
            duplicateParticipants: [],
            success: false,
            successParticipants: [],
            warning: false,
            warningParticipants: [],
            formatError: false,
            errorParticipants: []
        });
    };

    validateParticipants = (participants: Array<Participant>) => {
        //check for blank file
        if (isEmptyObject(participants)) {
            this.setState({emptyFileError: true});
            this.clearFileSelection();
            return false;
        }
        //check for blank registration codes
        let emptyIds = participants.some((participant: Participant) => {
            return isEmptyObject(participant.participantId);
        });
        if (emptyIds) {
            this.setState({emptyIdsError: true});
            this.clearFileSelection();
            return false;
        }
        //check for duplicate registration codes
        let duplicateIds = participants
            .map((participant: Participant) => {
                return participant.participantId;
            })
            .reduce(
                (
                    acc: Array<string>,
                    participantId: string,
                    index: number,
                    participantIds: Array<string>
                ) => {
                    if (
                        participantIds.indexOf(participantId) !== index &&
                        !acc.includes(participantId)
                    ) {
                        acc.push(participantId);
                    }
                    return acc;
                },
                []
            );
        if (duplicateIds.length > 0) {
            this.setState({
                duplicateParticipants: duplicateIds,
                duplicateError: true
            });
            this.clearFileSelection();
            return false;
        }
        return true;
    };

    csvToJSON = (csv: any) => {
        var lines = csv.split('\n');
        // strip all empty lines
        lines = lines.filter((line: string) => {
            return line.length > 7; //an empty line will be 6 commas in a csv file -> ",,,,,,/r"
        });
        var result = [];
        var headers = lines[0].split(',');
        for (var i = 1; i < lines.length; i++) {
            if (!isEmptyObject(lines[i])) {
                const obj: {[index: string]: any} = {};
                var currentline = lines[i].split(',');
                for (var j = 0; j < headers.length; j++) {
                    obj[headers[j].replace(/(\r\n|\n|\r)/gm, '')] = currentline[
                        j
                    ].replace(/(\r\n|\n|\r)/gm, '');
                }
                result.push(obj);
            }
        }
        return JSON.stringify(result);
    };

    // returns participantId's in first array that are also present in second array
    findExisting = (
        participants: Array<Participant>,
        existingIDs: Array<string>
    ) => {
        return participants
            .map((participant: Participant) => {
                return participant.participantId;
            })
            .filter((participantId: string) => {
                return existingIDs.includes(participantId);
            });
    };

    // returns first array without participantId's that are also present in second array
    removeExisting = (
        participants: Array<Participant>,
        existingIDs: Array<string>
    ) => {
        return participants.filter((participant: Participant) => {
            return !existingIDs.includes(participant.participantId);
        });
    };

    processFile = (files: any) => {
        let parent = this;
        let {survey, updateSurveyDispatch} = this.props;
        let existingParticipants: Array<string> = [];
        let successParticipants: Array<string> = [];
        let errorParticipants: Array<string> = [];
        let participantList = !isEmptyObject(survey.participants)
            ? survey.participants
            : [];
        let file = files[0];
        let reader = new FileReader();
        reader.readAsText(file);

        reader.onload = (event) => {
            let csvData = event.target.result;
            let p = parent.csvToJSON(csvData);
            let jsonData = JSON.parse(p);
            let participants = parent.JSONtoParticipants(jsonData);
            let isValid = parent.validateParticipants(participants);

            if (isValid) {
                // if no blank or duplicate participants and no empty files
                getAllParticipants()
                    .then((snapshot: any) => {
                        snapshot.forEach((doc: any) => {
                            existingParticipants.push(doc.data.participantId);
                        });
                        // find and remove participants already in survey
                        let existsInSurvey = parent.findExisting(
                            participants,
                            participantList
                        );
                        if (existsInSurvey.length > 0) {
                            parent.setState({
                                warningParticipants: existsInSurvey,
                                warning: true
                            });
                            participants = parent.removeExisting(
                                participants,
                                existsInSurvey
                            );
                        }
                        // find and add participants already in db but not in survey. Remove from list to be created.
                        let existsInDB = parent.findExisting(
                            participants,
                            existingParticipants
                        );
                        if (existsInDB.length > 0) {
                            existsInDB.forEach((participantId: string) => {
                                participantList.push(participantId);
                                successParticipants.push(participantId);
                            });
                            participants = parent.removeExisting(
                                participants,
                                existsInDB
                            );
                        }
                        // save new participants to db and add to survey list
                        let promises = participants.map(
                            (participant: Participant) => {
                                return new Promise<void>((resolve, reject) => {
                                    createParticipant(participant)
                                        .then(() => {
                                            participantList.push(
                                                participant.participantId
                                            );
                                            successParticipants.push(
                                                participant.participantId
                                            );
                                            parent.setState({
                                                successParticipants: successParticipants
                                            });
                                            resolve();
                                        })
                                        .catch((error: any) => {
                                            console.error(
                                                'Error adding document: ',
                                                error
                                            );
                                            errorParticipants.push(
                                                participant.participantId
                                            );
                                            parent.setState({
                                                errorParticipants: errorParticipants,
                                                formatError: true
                                            });
                                            resolve();
                                        });
                                });
                            }
                        );
                        // after all createParticipant() calls have resolved, update survey with new participants
                        Promise.all(promises)
                            .then(() => {
                                parent.setState({
                                    successParticipants: successParticipants,
                                    success: true
                                });
                                survey.participants = participantList;
                                updateSurveyDispatch(survey.id, survey);
                                parent.clearFileSelection();
                            })
                            .catch((err) => {
                                parent.setState({error: true});
                                console.error(err);
                            });
                    })
                    .catch((err: any) => {
                        parent.setState({error: true});
                        console.error(err);
                    });
            }
        };
    };

    submit = () => {
        let files = (document.getElementById(
            'participant-file-upload'
        ) as HTMLInputElement).files;
        if (files !== null && files.length > 0) {
            this.processFile(files);
        }
        this.resetErrorState();
    };

    render() {
        let {survey} = this.props;
        let {
            error,
            emptyIdsError,
            emptyFileError,
            duplicateError,
            duplicateParticipants,
            success,
            successParticipants,
            warning,
            warningParticipants,
            formatError,
            errorParticipants
        } = this.state;

        return (
            <IonRow>
                <form>
                    <IonLabel color="primary">Import Respondents: </IonLabel>
                    <input id="participant-file-upload" type="file" />
                    <IonButton
                        size="small"
                        fill="solid"
                        disabled={
                            (!isEmptyObject(survey.locked)
                                ? survey.locked
                                : false) && !survey.open
                        }
                        onClick={this.submit}>
                        Submit
                    </IonButton>
                    {emptyIdsError && (
                        <>
                            <br />
                            <IonLabel
                                color="danger"
                                style={{wordWrap: 'break-word'}}>
                                Upload was unsuccessful, one or more
                                registration codes is blank. Please review the
                                file and try again.
                                <br />
                            </IonLabel>
                        </>
                    )}
                    {emptyFileError && (
                        <>
                            <br />
                            <IonLabel
                                color="danger"
                                style={{wordWrap: 'break-word'}}>
                                Upload was unsuccessful, file does not contain
                                any valid respondents. Please review the file
                                and try again.
                                <br />
                            </IonLabel>
                        </>
                    )}
                    {duplicateError && (
                        <>
                            <br />
                            <IonLabel
                                color="danger"
                                style={{wordWrap: 'break-word'}}>
                                Upload was unsuccessful, registration codes must
                                be unique. Please remove duplicate codes and try
                                again.
                                <br />
                                Registration Codes:{' '}
                                {duplicateParticipants.toString()}
                                <br />
                            </IonLabel>
                        </>
                    )}
                    {formatError && (
                        <>
                            <br />
                            <IonLabel
                                color="danger"
                                style={{wordWrap: 'break-word'}}>
                                An error occurred while creating the following
                                respondents. Please ensure the file is formatted
                                correctly and try again.
                                <br />
                                Registration Codes:{' '}
                                {errorParticipants.toString()}
                                <br />
                            </IonLabel>
                        </>
                    )}
                    {error && (
                        <>
                            <br />
                            <IonLabel
                                color="danger"
                                style={{wordWrap: 'break-word'}}>
                                An error occurred. Please refresh the page and
                                try again. If the error persists, please contact
                                your system administrator.
                                <br />
                            </IonLabel>
                        </>
                    )}
                    {warning && (
                        <>
                            <br />
                            <IonLabel
                                color="warning"
                                style={{wordWrap: 'break-word'}}>
                                The following respondents are already included
                                in the survey, they have not been added again.
                                <br />
                                Respondent Id's:{' '}
                                {warningParticipants.toString()}
                                <br />
                            </IonLabel>
                        </>
                    )}
                    {success && successParticipants.length > 0 && (
                        <>
                            <br />
                            <IonLabel
                                color="success"
                                style={{wordWrap: 'break-word'}}>
                                Successfully added ({successParticipants.length}
                                ) Respondents to the survey.
                                <br />
                            </IonLabel>
                        </>
                    )}
                </form>
            </IonRow>
        );
    }
}

// Map Redux state to component props
function mapStateToProps(state: any) {
    return {
        survey: state.survey
    };
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch: any) {
    return {
        updateSurveyDispatch(surveyId: string, survey: any) {
            dispatch(updateSurvey(surveyId, survey));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ParticipantImport);
