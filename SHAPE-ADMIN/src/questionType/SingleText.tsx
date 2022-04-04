import React from 'react';
import {questionTypes} from '../utils/Constants';
import BaseQuestion from './BaseQuestion';

class SingleText extends React.Component<{}> {
    render() {
        return <BaseQuestion type={questionTypes.SINGLETEXT} />;
    }
}

export default SingleText;
