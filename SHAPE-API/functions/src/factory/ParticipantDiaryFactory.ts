import { Request } from "express";
import { ParticipantDiary } from "../interfaces";

export const participantDiaryFactory = (org: string, req: Request) => {
   const formType = req.body.formType;
   const participantDiary: ParticipantDiary = {
      formType: formType,
      profileDOB: req.body.profileDOB,
      profileName: req.body.profileName,
      surveyId: req.body.surveyId,
      participantId: req.body.participantId,
      org: org,
      dateWritten: req.body.dateWritten,
      userId: req.body.userId,
      profileId: req.body.profileId,
   };
   switch (formType) {
      case "Health Event":
         return getHealthEvent(participantDiary, req);
      case "Clinical Visit":
         return getDRVist(participantDiary, req);
      case "Withdrawal":
         return getWithdrawl(participantDiary, req);
      default:
         return participantDiary;
   }
};

const getHealthEvent = (participantDiary: ParticipantDiary, req: Request) => {
   participantDiary.healthEvent = req.body.healthEvent;
   participantDiary.healthEventSpecification =
      req.body.healthEventSpecification;
   participantDiary.onsetDate = req.body.onsetDate;
   participantDiary.endDate = req.body.endDate;
   participantDiary.ongoingStatus = req.body.ongoingStatus;
   participantDiary.descriptionData = req.body.descriptionData;
   participantDiary.outcome = req.body.outcome;
   participantDiary.outcomeSpecification = req.body.eventTreatment;
   participantDiary.eventTreatment = req.body.eventTreatment;
   participantDiary.postEventTreatment = req.body.postEventTreatment;

   return participantDiary;
};
const getDRVist = (participantDiary: ParticipantDiary, req: Request) => {
   participantDiary.assessers = req.body.assessers;
   participantDiary.assesserText = req.body.assesserText;
   participantDiary.GMFCScore = req.body.GMFCScore;
   participantDiary.GMFCType = req.body.GMFCType;
   participantDiary.eventDate = req.body.eventDate;
   participantDiary.visitReason = req.body.visitReason;
   participantDiary.prescription = req.body.prescription;
   participantDiary.device = req.body.device;

   return participantDiary;
};
const getWithdrawl = (participantDiary: ParticipantDiary, req: Request) => {
   participantDiary.withdrawalDate = req.body.withdrawalDate;
   participantDiary.withdrawalReason = req.body.withdrawalReason;
   return participantDiary;
};
