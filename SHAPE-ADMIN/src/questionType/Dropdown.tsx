import React from 'react';
import {questionTypes} from '../utils/Constants';
import BaseQuestion from './BaseQuestion';

class Dropdown extends React.Component<{}> {
    render() {
        return <BaseQuestion type={questionTypes.SELECT} />;
    }
}

export default Dropdown;
