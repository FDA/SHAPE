import { Profile } from "../interfaces";

export class Context {
  private _survey: string;
  private _participant: string;
  private _questionnaire: string;
  private _profile: Profile;
  private _id: string;

  constructor(
    survey: string,
    participant: string,
    questionnaire: string,
    profile: Profile,
    id: string
  ) {
    this._survey = survey;
    this._participant = participant;
    this._questionnaire = questionnaire;
    this._profile = profile;
    this._id = id;
  }

  get survey(): string {
    return this._survey;
  }

  set survey(value: string) {
    this._survey = value;
  }

  get participant(): string {
    return this._participant;
  }

  set participant(value: string) {
    this._participant = value;
  }

  get questionnaire(): string {
    return this._questionnaire;
  }

  set questionnaire(value: string) {
    this._questionnaire = value;
  }

  get profile(): Profile {
    return this._profile;
  }

  set profile(value: Profile) {
    this._profile = value;
  }

  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }
}
