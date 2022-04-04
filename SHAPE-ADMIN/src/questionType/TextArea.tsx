import React from 'react';
import {questionTypes} from '../utils/Constants';
import BaseQuestion from './BaseQuestion';

class TextArea extends React.Component<{}> {
    render() {
        return <BaseQuestion type={questionTypes.TEXTAREA} />;
    }
}

export default TextArea;
