import React from 'react';
import {questionTypes} from '../utils/Constants';
import BaseQuestion from './BaseQuestion';

class DateTime extends React.Component<{}> {
    render() {
        return <BaseQuestion type={questionTypes.DATETIME} />;
    }
}

export default DateTime;
