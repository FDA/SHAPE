import React, { ReactNode } from "react";
import { QuestionnaireQuestion } from "../../interfaces/DataTypes";

export class RequiredDecorator {
  public decorate(question: QuestionnaireQuestion) {
    let decorator: ReactNode = null;
    if (question.hasOwnProperty("required")) {
      const { required } = question;
      if (required) {
        decorator = <span>This question is required.</span>;
      }
    }
    return decorator;
  }
}
