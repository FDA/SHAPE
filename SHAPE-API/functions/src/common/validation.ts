import { NextFunction, Request, Response } from "express";
import { check, validationResult } from "express-validator";

// middleware function that checks validation results and returns errors if any exist
export const validate = (req: Request, res: Response, next: NextFunction) => {
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
      return res.status(422).json({
         errors: errors.array()
      });
   }
   next();
   return;
};

// custom field validation functions
const notEmpty = (field: string) => {
   return check(field)
      .exists()
      .withMessage("missing field")
      .notEmpty()
      .withMessage("empty field")
};

const string = (field: string) => {
   return check(field)
      .exists()
      .withMessage("missing field")
      .isString()
      .withMessage("must be String")
      .notEmpty()
      .withMessage("empty field");
};

const optionalString = (field: string) => {
   return check(field)
      .optional()
      .isString()
      .withMessage("must be String");
}

const boolean = (field: string) => {
   return check(field)
      .exists()
      .withMessage("missing field")
      .isBoolean()
      .withMessage("must be Boolean");
};

const optionalBoolean = (field: string) => {
   return check(field)
      .optional()
      .isBoolean()
      .withMessage("must be Boolean");
};

const optionalBooleanOrNull = (field: string) => {
   const booleanTypes = ["true", "false", true, false, 1, 0, null]
   return check(field)
      .optional()
      .isIn(booleanTypes)
      .withMessage("must be Boolean or null");
}

const array = (field: string) => {
   return check(field)
      .exists()
      .withMessage("missing field")
      .isArray()
      .withMessage("must be Array")
};

const optionalArray = (field: string) => {
   return check(field)
      .optional()
      .isArray()
      .withMessage("must be Array")
};

const optionalNumber = (field: string) => {
   return check(field)
      .optional()
      .isNumeric()
      .withMessage("must be Number")
};

const optionalObject = (field: string) => {
   return check(field)
      .optional()
      .isObject()
      .withMessage("must be Object")
};


// Field validation middlewares for each endpoint

// Auth
export const getAuthValidation = () => {
   return [
      string("username"), 
      string("password"),
   ];
};

// Image
export const createImageValidation = () => {
   return [
      notEmpty("data"), 
      string("id"), 
      string("fileName")
   ];
};

// Inbox
export const createInboxValidation = () => {
   return [
      string("participantId"),
      string("userId"),
      string("message"),
      string("subject"),
      string("timestamp"),
      optionalBoolean("read")
   ];
};

export const updateInboxValidation = () => {
   return [
      string("participantId"),
      string("userId"),
      string("message"),
      string("subject"),
      string("timestamp"),
      optionalBoolean("read")
   ];
};


// Informed Consent
export const createInformedConsentValidation = () => {
   return [
      string("surveyId"),
      string("participantId"),
      string("emailSent"),
      string("dateAgreed"),
      string("userId"),
   ];
};


// Message 
export const createMessageValidation = () => {
   return [
      string("message"), 
      string("subject"), 
      string("timestamp"),
      optionalArray("emailRecipients"),
      optionalArray("pushRecipients"),
      optionalArray("inAppRecipients"),
      optionalArray("smsRecipients"),
   ];
};


// Participant
export const createParticipantValidation = () => {
   return [
      string("participantId"), 
      array("securityQuestions"),
      //securityQuestions
      optionalString("securityQuestions.*.question"),
      optionalString("securityQuestions.*.answer"),
      optionalBoolean("public"),
      optionalBoolean("optedOut")
   ];
};

export const updateParticipantValidation = () => {
   return [
      optionalString("participantId"),
      optionalArray("securityQuestions"),
      //securityQuestions
      optionalString("securityQuestions.*.question"),
      optionalString("securityQuestions.*.answer"),
      optionalBoolean("public"),
      optionalBoolean("optedOut")
   ]
}


// Participant Diary
export const createParticipantDiaryValidation = () => {
   const formTypes: string[] = [
      "Health Event", 
      "Clinical Visit", 
      "Withdrawal"
   ];
   return [
      string("profileDOB"),
      string("profileName"),
      string("surveyId"),
      string("participantId"),
      string("formType").isIn(formTypes).withMessage("invalid formType"),
      string("dateWritten"),
      string("userId"),
      optionalString("profileId"),
      // Event
      optionalNumber("healthEvent"),
      optionalString("healthEventSpecification"),
      optionalString("onsetDate"),
      optionalString("endDate"),
      optionalNumber("ongoingStatus"),
      optionalString("descriptionData"),
      optionalNumber("outcome"),
      optionalString("outcomeSpecification"),
      optionalNumber("eventTreatment"),
      optionalNumber("postEventTreatment"),
      // Dr Visit
      //optionalArray("assessers"),
      optionalNumber("assessers"),
      optionalString("assesserText"),
      optionalString("GMFCScore"),
      optionalNumber("GMFCType"),
      optionalString("eventDate"),
      optionalBoolean("redirect"),
      optionalString("visitReason"),
      optionalNumber("prescription"),
      optionalArray("device"),
      // Withdrawl
      optionalString("withdrawalDate"),
      optionalString("withdrawalReason")
   ];
};

export const updateParticipantDiaryValidation = () => {
   const formTypes: string[] = [
      "Health Event", 
      "Clinical Visit", 
      "Withdrawal"
   ];
   return [
      optionalString("profileDOB"),
      optionalString("profileName"),
      optionalString("surveyId"),
      optionalString("participantId"),
      optionalString("formType").optional().isIn(formTypes).withMessage("invalid formType"),
      optionalString("dateWritten"),
      // Event
      optionalNumber("healthEvent"),
      optionalString("healthEventSpecification"),
      optionalString("onsetDate"),
      optionalString("endDate"),
      optionalNumber("ongoingStatus"),
      optionalString("descriptionData"),
      optionalNumber("outcome"),
      optionalString("outcomeSpecification"),
      optionalNumber("eventTreatment"),
      optionalNumber("postEventTreatment"),
      // Dr Visit
      //optionalArray("assessers"),
      optionalNumber("assessers"),
      optionalString("assesserText"),
      optionalString("GMFCScore"),
      optionalNumber("GMFCType"),
      optionalString("eventDate"),
      optionalBoolean("redirect"),
      optionalString("visitReason"),
      optionalNumber("prescription"),
      optionalArray("device"),
      // Withdrawl
      optionalString("withdrawalDate"),
      optionalString("withdrawalReason"),
   ];
};


// Participant Response
export const createParticipantResponseValidation = () => {
   return [
      string("surveyId"),
      string("questionnaireId"),
      string("profile"),
      string("profileDOB"),
      string("participantId"),
      string("dateWritten"),
      optionalArray("responses"),
      string("userId"),
      optionalString("profileId")
   ];
};

export const updateParticipantResponseValidation = () => {
   return [
      optionalBoolean("complete"),
      optionalArray("responses"),
   ];
};


// Question
export const createQuestionValidation = () => {
   const questionTypes: string[] = [
      "info",
      "textarea",
      "singletext",
      "radiogroup",
      "checkboxgroup",
      "select",
      "range",
      "slider",
      "datetime",
   ];

   return [
      string("title"),
      string("variable"),
      string("type").isIn(questionTypes).withMessage("invalid question type"),
      optionalString("text"),
      optionalBoolean("required"),
      optionalString("requiredMessage"),
      optionalString("placeholder"),
      optionalString("max"),
      optionalString("min"),
      optionalArray("choices"),
      optionalString("format"),
      optionalArray("rules"),
      optionalArray("sections")
   ];
};

export const updateQuestionValidation = () => {
   const questionTypes: string[] = [
      "info",
      "textarea",
      "singletext",
      "radiogroup",
      "checkboxgroup",
      "select",
      "range",
      "slider",
      "datetime",
   ];
   return [
      optionalString("title"),
      optionalString("variable"),
      optionalString("type").optional().isIn(questionTypes).withMessage("invalid question type"),
      optionalString("text"),
      optionalBoolean("required"),
      optionalString("requiredMessage"),
      optionalString("placeholder"),
      optionalString("max"),
      optionalString("min"),
      optionalArray("choices"),
      optionalString("format"),
      optionalArray("rules"),
      optionalArray("sections")
   ];
};


// Questionnaire
export const createQuestionniareValidation = () => {
   return [
      string("surveyId"),
      string("name"),
      string("shortDescription"),
      string("description"),
      string("dateCreated"),
      boolean("open"),
      optionalBoolean("archived"),
      optionalBoolean("locked"),
      optionalArray("participants"),
      optionalArray("questions"),
      optionalBoolean("public"),
      optionalObject("form")
   ];
};

export const updateQuestionnaireValidation = () => {
   return [
      optionalString("surveyId"),
      optionalString("name"),
      optionalString("shortDescription"),
      optionalString("description"),
      optionalBoolean("open"),
      optionalBoolean("archived"),
      optionalBooleanOrNull("locked"), 
      optionalArray("participants"),
      optionalArray("questions"),
      optionalBoolean("public"),
      optionalObject("form")
   ];
}


// Survey
export const createSurveyValidation = () => {
   return [
      string("name"),
      string("shortDescription"),
      string("description"),
      string("informedConsent"),
      string("dateCreated"),
      boolean("open"),
      optionalBoolean("locked"),
      optionalBoolean("archived"),
      optionalArray("participants"),
      optionalBoolean("public"),
   ];
};

export const updateSurveyValidation = () => {
   return [
      optionalString("name"),
      optionalString("shortDescription"),
      optionalString("description"),
      optionalString("informedConsent"),
      optionalBoolean("open"),
      optionalBooleanOrNull("locked"),
      optionalBoolean("archived"),
      optionalArray("participants"),
      optionalBoolean("public"),
      optionalArray("scheduledJobs")
   ];
};


// User
export const createUserValidation = () => {
   return [
      optionalString("participantId"),
      optionalString("userName"),
      optionalBoolean("active"),
      optionalBoolean("agreedToTerms"),
      optionalString("agreedToTermsDate"),
      optionalString("dateCreated"),
      optionalBoolean("emailEnabled"),
      optionalBoolean("smsEnabled"),
      optionalString("firstName"),
      optionalString("lastName"),
      optionalString("phoneNumber"),
      optionalArray("profiles"),
      //profile
      optionalString("profiles.*.dob"),
      optionalString("profiles.*.gender"),
      optionalString("profiles.*.id"),
      optionalBoolean("profiles.*.isNew"),
      optionalString("profiles.*.name"),
      optionalBoolean("pushEnabled"),
      optionalArray("securityQuestions"),
      //security questions
      optionalString("securityQuestions.*.answer"),
      optionalString("securityQuestions.*.question"),
   ];
};

export const updateUserValidation = () => {
   return [
      optionalString("participantId"),
      optionalString("userName"),
      optionalBoolean("active"),
      optionalBoolean("agreedToTerms"),
      optionalString("agreedToTermsDate"),
      optionalString("dateCreated"),
      optionalBoolean("emailEnabled"),
      optionalBoolean("smsEnabled"),
      optionalString("firstName"),
      optionalString("lastName"),
      optionalString("phoneNumber"),
      optionalArray("profiles"),
      //profile
      optionalString("profiles.*.dob"),
      optionalString("profiles.*.gender"),
      optionalString("profiles.*.id"),
      optionalBoolean("profiles.*.isNew"),
      optionalString("profiles.*.name"),
      optionalBoolean("pushEnabled"),
      optionalArray("securityQuestions"),
      //security questions
      optionalString("securityQuestions.*.answer"),
      optionalString("securityQuestions.*.question"),  
   ]
}



