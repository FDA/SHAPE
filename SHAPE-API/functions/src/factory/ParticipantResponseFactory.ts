import {ParticipantResponse} from "../interfaces";
import {Request} from "express";

export const participantResponseFactory = (org:string, req: Request): ParticipantResponse => {
    return {
        surveyId: req.body.surveyId,
        questionnaireId: req.body.questionnaireId,
        profile: req.body.profile,
        profileDOB: req.body.profileDOB,
        participantId: req.body.participantId,
        dateWritten: req.body.dateWritten,
        responses: req.body.responses,
        complete: req.body.complete,
        org: org,
        userId: req.body.userId,
        profileId: req.body.profileId,
    }
}
