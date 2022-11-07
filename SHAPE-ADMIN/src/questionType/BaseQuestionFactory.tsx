import React from 'react';
import {questionTypes} from '../utils/Constants';
import BaseSelect from './BaseSelect';
import BaseText from './BaseText';
import BaseDateTime from './BaseDateTime';
import BaseRange from './BaseRange';
import BaseSlider from './BaseSlider';
import {QuestionChoice} from '../interfaces/DataTypes';

interface Props {
    type: string;
    choices: Array<QuestionChoice>;
    displayChoices: any;
    placeholder: string;
    format: string;
    min: string;
    max: string;
    step: string;
    pin: boolean;
    ticks: boolean;
    sliderValue: number;
    handleInputChange: Function;
    addChoice: Function;
    doReorder: Function;
    handleChoiceValueChange: Function;
    handleChoiceTextChange: Function;
    deleteChoice: Function;
    handlePlaceholderChange: Function;
    setFormat: Function;
    handleMinChange: Function;
    handleMaxChange: Function;
}

class BaseQuestionFactory extends React.Component<Props> {
    render() {
        let {
            type,
            choices,
            displayChoices,
            addChoice,
            doReorder,
            handleChoiceValueChange,
            handleChoiceTextChange,
            deleteChoice,
            handlePlaceholderChange,
            placeholder,
            format,
            setFormat,
            handleMinChange,
            handleMaxChange,
            min,
            max,
            step,
            pin,
            ticks,
            sliderValue,
            handleInputChange
        } = this.props;

        switch (type) {
            case questionTypes.CHECKBOXGROUP:
            case questionTypes.SELECT:
            case questionTypes.RADIOGROUP:
                return (
                    <BaseSelect
                        type={type}
                        choices={choices}
                        displayChoices={displayChoices}
                        addChoice={addChoice}
                        doReorder={doReorder}
                        handleChoiceValueChange={handleChoiceValueChange}
                        handleChoiceTextChange={handleChoiceTextChange}
                        deleteChoice={deleteChoice}
                    />
                );
            case questionTypes.SINGLETEXT:
            case questionTypes.TEXTAREA:
                return (
                    <BaseText
                        handlePlaceholderChange={handlePlaceholderChange}
                        placeholder={placeholder}
                    />
                );
            case questionTypes.DATETIME:
                return <BaseDateTime format={format} setFormat={setFormat} />;
            case questionTypes.RANGE:
                return (
                    <BaseRange
                        handleMinChange={handleMinChange}
                        handleMaxChange={handleMaxChange}
                        min={min}
                        max={max}
                    />
                );
            case questionTypes.SLIDER:
                return (
                    <BaseSlider
                        min={min}
                        max={max}
                        step={step}
                        pin={pin}
                        ticks={ticks}
                        sliderValue={sliderValue}
                        handleInputChange={handleInputChange}
                    />
                );
            default:
                return <div />;
        }
    }
}

export default BaseQuestionFactory;
