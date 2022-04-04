import React from 'react';
import {questionTypes} from '../utils/Constants';
import BaseQuestion from './BaseQuestion';

class Slider extends React.Component<{}> {
    render() {
        return <BaseQuestion type={questionTypes.SLIDER} />;
    }
}

export default Slider;
