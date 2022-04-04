// DoctorVisit

export const assessmentArr = [
  { val: 0, text: "Medical Doctor" },
  { val: 1, text: "Physician’s Assistant" },
  { val: 2, text: "Nurse Practitioner" },
  { val: 3, text: "Physical Therapist" },
  { val: 5, text: "Other - Please specify" },
  { val: 6, text: "Not applicable" },
];

export const GMFCArr = [
  { val: 0, text: "GMFC-MLD (0-6 scale)" },
  { val: 1, text: "GMFM 88 was assessed (0-100 scale)" },
  { val: 2, text: "GMFM 66 (0-100 scale)" },
  { val: 3, text: "Assessment Not Performed" },
  {
    val: 4,
    text: "Not applicable (choose this option if there was no clinical visit today or in the past 7 days)",
  },
];
export const treatmentVals = [
  { val: 0, text: "None" },
  { val: 1, text: "Medication" },
  { val: 2, text: "Non-medication" },
  { val: 3, text: "Both" },
  { val: 4, text: "Unsure" },
];

export const deviceVals = [
  { val: 0, text: "None of these" },
  { val: 1, text: "Wheelchair" },
  { val: 2, text: "Walker" },
  { val: 3, text: "Stander" },
  { val: 4, text: "Orthotic braces for hands" },
  { val: 5, text: "Orthotic braces for legs" },
  { val: 6, text: "Other orthotic braces" },
  { val: 7, text: "Eyegaze communication device" },
  { val: 8, text: "DynaVox communication device" },
  { val: 9, text: "Other" },
  { val: 10, text: "Not sure" },
  { val: 11, text: "Not applicable" },
];

// EventForm

export const optionsArr = [
  { val: 0, text: "UTI" },
  { val: 1, text: "Pneumonia" },
  { val: 2, text: "Feeding Tube" },
  { val: 3, text: "Ventilator" },
  { val: 4, text: "Seizure" },
  { val: 5, text: "Emergency Department Visit" },
  { val: 6, text: "Initial or Prolonged Hospitalization" },
  { val: 7, text: "Persistent or Significant Disability" },
  { val: 8, text: "Death" },
  { val: 10, text: "Other" }, // enter field
];

export const outcomeChoices = [
  { val: 0, text: "Recovered" },
  { val: 1, text: "Recovered but with some medical complications" },
  { val: 2, text: "Recovering" },
  { val: 3, text: "Not recovered" },
  { val: 4, text: "Fatal" },
  { val: 5, text: "Unknown" },
  { val: 7, text: "Other" },
];

export const treatmentChoices = [
  { val: 0, text: "None" },
  { val: 1, text: "Medication" },
  { val: 2, text: "Non-medication" },
  { val: 3, text: "Both" },
  { val: 4, text: "Unsure" },
];

export const ongoingArr = [
  { val: 0, text: "Yes" },
  { val: 1, text: "No" },
];

export const doctorVisit = [
  { label: "eventDate", value: "Date of Clinical Visit" },
  { label: "profileDOB", value: "Date of Birth" },
  { label: "profileName", value: "Name of Participant" },
  { label: "visitReason", value: "Reason for Clinical Visit" },
  { label: "assessers", value: "Who conducted the assessment?" },
  { label: "assesserText", value: "Specify Assesser" },
  {
    label: "GMFCType",
    value: "Which Gross Motor Function assessment did the provider use?",
  },
  { label: "GMFCScore", value: "Gross Motor Function Score" },
  {
    label: "prescription",
    value: "What treatment was prescribed for the event?",
  },
  { label: "dateWritten", value: "Event Recorded Date" },
  {
    label: "device",
    value:
      "What medical or assistive devices does the Participant use to help move around, communicate, or do things?",
  },
];

export const withdrawl = [
  { label: "eventDate", value: "Date of Clinical Visit" },
  { label: "profileDOB", value: "Date of Birth" },
  { label: "profileName", value: "Name of Participant" },
  { label: "withdrawalReason", value: "Withdrawl Reason" },
  { label: "dateWritten", value: "Event Recorded Date" },
  { label: "withdrawalDate", value: "Withdrawal Date" },
];

export const he = [
  { label: "eventDate", value: "Date of Clinical Visit" },
  { label: "profileDOB", value: "Date of Birth" },
  { label: "profileName", value: "Name of Participant" },
  { label: "dateWritten", value: "Event Recorded Date" },
  { label: "endDate", value: "End Date" },
  { label: "descriptionData", value: "Description" },
  { label: "healthEvent", value: "Health Event" },
  {
    label: "healthEventSpecification",
    value: "Health Event Specicification",
  },
  { label: "postEventTreatment", value: "Post Event Treatment" },
  { label: "outcomeSpecification", value: "Outcome" },
  { label: "eventTreatment", value: "Event Treatment" },
  { label: "onsetDate", value: "Onset Date" },
  { label: "outcome", value: "Outcome" },
  { label: "ongoingStatus", value: "Ongoing Status" },
];
