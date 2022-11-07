import React from 'react';
import { QuestionnaireQuestion } from '../../interfaces/DataTypes';
import DatePicker from '../../pages/components/DatePicker';

interface PassedProps {
    currentAnswerValue: Function;
    question: QuestionnaireQuestion;
    valueEventHandler: Function;
    clearValue: Function;
}

interface CustomDateTimeState {
    displayValue: string;
}

export class CustomDateTime extends React.Component<PassedProps, CustomDateTimeState> {
    dateTimeRef: React.RefObject<any>;

    constructor(props: PassedProps) {
        super(props);
        this.state = {
            displayValue: ''
        };
        this.dateTimeRef = React.createRef();
    }

    componentDidMount() {
        const currentAnswer = this.props.currentAnswerValue();
        this.setState({
            displayValue: currentAnswer
        });
    }

    componentDidUpdate(prevProps: Readonly<PassedProps>) {
        if (prevProps.question.name !== this.props.question.name) {
            const currentAnswer = this.props.currentAnswerValue();
            this.setState({
                displayValue: currentAnswer
            });
        }
    }

    setDate = (event: any) => {
        const displayValue = event.target.value;
        const currentAnswer = this.props.currentAnswerValue();

        if (displayValue !== currentAnswer) {
            this.setState({ displayValue: displayValue }, () => {
                this.props.valueEventHandler(event);
            });
        }
    };

    render() {
        const { question } = this.props;
        const { displayValue } = this.state;

        return (
            <>
                <DatePicker
                    label='Date'
                    name={question.name}
                    date={displayValue && new Date(displayValue).toISOString()}
                    setDate={this.setDate}
                    max='2100'
                    min='1900'
                />
            </>
        );
    }
}
