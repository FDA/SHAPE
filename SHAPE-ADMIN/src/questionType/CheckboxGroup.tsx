import React from 'react';
import BaseQuestion from './BaseQuestion';
import {questionTypes} from '../utils/Constants';

class CheckBoxGroup extends React.Component<{}> {
    render() {
        return <BaseQuestion type={questionTypes.CHECKBOXGROUP} />;
    }
}

export default CheckBoxGroup;
