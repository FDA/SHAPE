import { IonDatetime } from "@ionic/react";
import React from "react";
import { QuestionnaireQuestion } from "../../interfaces/DataTypes";

interface PassedProps {
  defaultValue: string;
  currentAnswerValue: Function;
  question: QuestionnaireQuestion;
  valueEventHandler: Function;
  clearValue: Function;
  format: string;
}

interface CustomDateTimeState {
  valueStack: Array<any>;
  displayValue: string;
  initialValue: string;
  prevValue: string;
}

export class CustomDateTime extends React.Component<
  PassedProps,
  CustomDateTimeState
> {
  dateTimeRef: React.RefObject<any>;

  constructor(props: PassedProps) {
    super(props);
    this.state = {
      displayValue: "",
      initialValue: "",
      prevValue: "",
      valueStack: [],
    };
    this.dateTimeRef = React.createRef();
  }

  componentDidMount() {
    let { defaultValue } = this.props;
    let currentAnswer = this.props.currentAnswerValue();
    let displayValue = currentAnswer || defaultValue;

    this.setState({
      displayValue,
      initialValue: currentAnswer,
      prevValue: currentAnswer,
    });
  }

  numberToString(number:number) {
    if(number < 10) {
      return `0${number}`
    }
    return number;
  }

  render() {
    let { question, valueEventHandler, clearValue, format } = this.props;

    let customOptions = {
      buttons: [
        {
          text: "Clear",
          handler: (event: any) => {
            this.setState(
              {
                displayValue: "",
              },
              () => clearValue(question.name)
            );
          },
        },
        {
          text: "Cancel",
          handler: (e: any) => {
            let tempValueStack = this.state.valueStack;
            let prevValue = tempValueStack[tempValueStack.length - 1];
            if (!prevValue) prevValue = "";
            let tempEvent = {
              target: {
                name: question.name,
                value: prevValue,
              },
            };
            this.setState(
              {
                displayValue: prevValue,
                valueStack: tempValueStack,
              },
              () => {
                valueEventHandler(tempEvent);
              }
            );
          },
        },
        {
          text: "Okay",
          handler: (data: any) => {
            let dateStr = `${data.year.value}-${this.numberToString(data.month.value)}-${this.numberToString(data.day.value)}`;
            let tempEvent = {
              target: {
                name: question.name,
                value: dateStr,
              },
            };

            this.setState(
              {
                displayValue: dateStr,
                valueStack: [...this.state.valueStack, dateStr],
              },
              () => {
                valueEventHandler(tempEvent);
              }
            );
          },
        },
      ],
    };
    const date = new Date();
    const minYear = date.getFullYear() - 50 + "";
    const maxYear = date.getFullYear() + 50 + "";

    return (
      <>
        <IonDatetime
          ref={this.dateTimeRef}
          id={question.name}
          displayFormat={format}
          name={question.name}
          placeholder={format}
          value={this.state.displayValue}
          min={minYear}
          max={maxYear}
          pickerOptions={customOptions}
        />
      </>
    );
  }
}
