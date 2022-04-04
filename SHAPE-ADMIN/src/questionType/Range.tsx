import React from 'react';
import {questionTypes} from '../utils/Constants';
import BaseQuestion from './BaseQuestion';

class Range extends React.Component<{}> {
    render() {
        return <BaseQuestion type={questionTypes.RANGE} />;
    }
}

export default Range;
