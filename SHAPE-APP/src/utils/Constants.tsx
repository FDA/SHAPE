// DATE FORMATTING
export const dateFormats = {
  MMddyyyy: "MM/dd/yyyy",
  MMDDYYYY: "MM/DD/YYYY",
  YYYYMMDD: "YYYY-MM-DD",
  MMMMDDYYYY: "MMMM-DD-YYYY",
  MMMDDYYYY: "MMM DD, YYYY",
  MM_DD_YYYY: "MM-DD-YYYY",
  yyyyMMdd: "yyyy-MM-dd",
  MM_dd_yyyy: "MM-dd-yyyy",
};

// LOGGING
export const environments = {
  DEVELOPMENT: "development",
};

// IMAGE
export const images = {
  SHAPE_LOGO_HORIZONTAL_DARKMODE:
    "/assets/icon/FDA_SHAPE_Logo_Dark Mode_Horizontal.png",
  SHAPE_LOGO_HORIZONTAL: "/assets/icon/FDA_SHAPE_Logo_Horizontal.png",
  LOGO_300_DARK: "/assets/icon/logo-300-dark.png",
  LOGO_300: "/assets/icon/logo-300.png",
  ONE_STEP: "/assets/icon/one-step.png",
  LOGO: "/assets/icon/logo.png",
  LOGO_DARK: "/assets/icon/logo-dark.png",
  WATCH: "/assets/icon/watch.png",
  PROFILE: "/assets/icon/profile.png",
  LOGIN_LANDING: "/assets/icon/login-landing.png",
  GROUP_LOGO_DARK: "/assets/icon/group-logo-dark.png",
  GROUP_LOGO: "/assets/icon/group-logo2.png",
  SHAPE_LOGO_IMAGE: "/assets/icon/FDA_SHAPE_Logo_Image.png",
  WAITING_ROOM: "/assets/icon/waitingroom.png",
};

// ROUTES
export const routes = {
  HOME: "/",
  LOGIN: "/login",
  LOGIN_CARD: "/loginCard",
  REGISTER: "/register",
  PASSWORD_RESET: "/password-reset",
  SECURITY_QUESTIONS: "/security-questions",
  PARTICIPANT_ADD: "/participant-add",
  PARTICIPANT_QUERY: "/participant-query",
  NEW_DIARY_ENTRY: "/tabs/diary/newEntry",
  DIARY: "/tabs/diary",
  START_EHR_LINK: "/tabs/tab2/startEHRLink",
  ADD_EHR: "/tabs/tab2/addEHR",
  TABS: "/tabs",
  TAB1: "/tabs/tab1",
  TAB2: "/tabs/tab2",
  TAB3: "/tabs/tab3",
  EHR: "/tabs/tab2/ehr",
  STORE_EHR: "/store-ehr",
  DO_QUESTIONNAIRE: "/tabs/do-questionnaire",
  TERMS_AND_CONDITIONS: "/tc",
  SURVEY: "/tabs/survey",
  PREVIEW_QUESTIONNAIRE: "/preview-questionnaire",
  PREVIEW_SURVEY: "/preview-survey",
  ON_EHR_COMPLETE: "/on-ehr-complete",
  ACTION: "/action",
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
  USERS: "users",
};

// DIARY VIEWS
export const diaryViews = {
  SURVEYSELECTION: "surveySelection",
  HEALTHEVENT: "healthEvent",
  CLINICALVISIT: "clinicalVisit",
  WITHDRAWAL: "withdrawal",
};

// INFO CARD SECTION TYPES
export const sectionTypes = {
  BREAK: "break",
  HEADER: "header",
  TEXTAREA: "textarea",
  LIST: "list",
  TABLE: "table",
  IMAGE: "image",
};

// QUESTION TYPES
export const questionTypes = {
  CHECKBOXGROUP: "checkboxgroup",
  DATETIME: "datetime",
  INFO: "info",
  RADIOGROUP: "radiogroup",
  RANGE: "range",
  SINGLETEXT: "singletext",
  TEXTAREA: "textarea",
  SLIDER: "slider",
  DROPDOWNGROUP: "dropdowngroup",
  SELECT: "select",
};

// FIREBASE FUNCTIONS
export const firebaseFunctions = {
  CHECKADMINROLE: "checkAdminRole",
  GETPREVIEWTOKEN: "getPreviewToken",
  SETPARTICIPANTIDCLAIM: "setParticipantIdClaim",
  GETUSERCODE: "getUserCode",
  GETPATIENTEHR: "getPatientEHR",
  GETPATIENT: "getPatient",
  SEARCH: "search",
  GETNEWAUTHCODE: "getNewAuthCode",
  GETBEARERTOKEN: "getBearerToken",
  GETUSERLIST: "getUserList",
  SENDMAIL: "sendMail",
  GETCUSTOMCLAIMS: "getCustomClaims"
};
