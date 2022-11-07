import { BaseQuestionFactory } from "./BaseQuestionFactory";
import React, { ReactNode } from "react";
import { QuestionnaireQuestion } from "../../interfaces/DataTypes";
import { questionTypes } from "../../utils/Constants";
import { CustomSelect } from "../components";

class SelectFactory extends BaseQuestionFactory {
  createJSX(
    question: QuestionnaireQuestion,
    valueEventHandler: Function,
    defaultValue: string
  ): ReactNode {
    return question.type === questionTypes.SELECT ? (
      <CustomSelect
        question={question}
        defaultValue={defaultValue}
        valueEventHandler={valueEventHandler}
      />
    ) : null;
  }
}

export default SelectFactory;
