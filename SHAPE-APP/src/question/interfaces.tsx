import { QuestionnaireQuestion } from "../interfaces/DataTypes";

export interface Questionnaire {
  questions: QuestionnaireQuestion[];
  id?: string;
}

export interface Profile {
  participantId: string;
  name: string;
  dob: string;
  gender: string;
  href?: string;
  isNew?: boolean;
  age?: number;
  id?: string;
}
