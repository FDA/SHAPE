export const SECTIONTYPES = [
    {
        key: "break",
        value: "Line Break"
    },
    {
        key: "header",
        value: "Header"
    },
    {
        key: "textarea",
        value: "Text Area"
    },
    {
        key: "list",
        value: "List"
    },
    {
        key: "table",
        value: "Table"
    },
    {
        key: "image",
        value: "Image"
    }
];

export const FORMATS = [
    {
        name: "date",
        formatStr: "MM DD, YYYY"
    }
];

export const routes = {
    LOGIN: "/login",
    SURVEY: "/survey",
    HOME: "/home",
    LOGIN_CARD: "/loginCard",
    NEW_NOTIFICATION: "/newNotification",
    PAST_NOTIFICATIONS: "/pastNotifications",
    EHR_RECEIPTS: "/ehrReceipts",
    ORG_LIST: "/orgList",
    NEW_SURVEY: "/newSurvey",
    PASSWORD_RESET: "/password-reset",
    ORG_ADD: "/orgAdd",
    EDIT_QUESTIONS: "/editQuestions",
    NEW_Q13_PARTICIPANT: "/newQ13Participant",
    NEW_QUESTIONNAIRE: "/newQuestionnaire",
    NEW_PARTICIPANT: "/newParticipant"
};

export const dateFormats = {
    MMDDYYZYYHHmmss: "MM/DD/YYYY HH:mm:ss",
    MMddyyZYYHHmmss: "MM/dd/yyyy HH:mm:ss",
    MM_DD_YYYY: "MM-DD-YYYY",
    MM_dd_yyyy: "MM-dd-yyyy",
    MMDDYYYY: "MM/DD/YYYY",
    MMMDDYYYY: "MMM DD, YYYY HH:mm",
    MMddyyyy: "MM/dd/yyyy"
};

export const images = {
    SHAPE_LOGO_HORIZONTAL: "/assets/icon/FDA_SHAPE_Logo_Horizontal.png"
};

// FIREBASE COLLECTIONS
export const collections = {
    EHR: "ehr",
    ERRORS: "errors",
    IMAGE: "image",
    INBOX: "inbox",
    INFORMED_CONSENT: "informed-consent",
    MESSAGE: "message",
    ORG: "org",
    PARTICIPANT: "participant",
    PARTICIPANT_DIARY: "participant-diary",
    PARTICIPANT_RESPONSE: "participant-response",
    QUESTION: "question",
    QUESTIONNAIRE: "questionnaire",
    SURVEY: "survey",
    USERS: "users"
};

export const questionTypes = {
    CHECKBOXGROUP: "checkboxgroup",
    DATETIME: "datetime",
    INFO: "info",
    RADIOGROUP: "radiogroup",
    RANGE: "range",
    SINGLETEXT: "singletext",
    TEXTAREA: "textarea",
    SLIDER: "slider",
    SELECT: "select"
};

// INFO CARD SECTION TYPES
export const sectionTypes = {
    BREAK: "break",
    HEADER: "header",
    TEXTAREA: "textarea",
    LIST: "list",
    TABLE: "table",
    IMAGE: "image"
};

export const jobTypes = {
    onSurveyJoined: {
        value: "onSurveyJoined",
        name: "joining this survey",
        title: "Survey Joined"
    },
    onQuestionnaireCompleted: {
        value: "onQuestionnaireCompleted",
        name: "completing questionnaire",
        title: "Questionnaire Completed"
    },
    onDiaryNotWritten: {
        value: "onDiaryNotWritten",
        name: "not creating a self-report",
        title: "Self-Report Not Written"
    },
    onQuestionnaireNotCompleted: {
        value: "onQuestionnaireNotCompleted",
        name: "not completing questionnaire",
        title: "Questionnaire Not Completed"
    }
};
