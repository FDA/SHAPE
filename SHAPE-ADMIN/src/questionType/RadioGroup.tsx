import React from 'react';
import {questionTypes} from '../utils/Constants';
import BaseQuestion from './BaseQuestion';

class RadioGroup extends React.Component<{}> {
    render() {
        return <BaseQuestion type={questionTypes.RADIOGROUP} />;
    }
}

export default RadioGroup;
