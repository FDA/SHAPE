import { BaseQuestionFactory } from "./BaseQuestionFactory";
import React, { ReactNode } from "react";
import { InfoCardContainer } from "../components";
import { QuestionnaireQuestion } from "../../interfaces/DataTypes";
import { questionTypes } from "../../utils/Constants";

export default class InfoCardFactory extends BaseQuestionFactory {
  createJSX(
    question: QuestionnaireQuestion
  ): ReactNode {
    return question.type === questionTypes.INFO ? (
      <InfoCardContainer question={question} />
    ) : null;
  }
}
