import {IonTextarea} from '@ionic/react';
import React from 'react';
import {InfoCardTextSection} from '../../../interfaces/DataTypes';

interface PassedProps {
    section: InfoCardTextSection;
    storeSection: Function;
    index: number;
}

interface State {
    text: string;
}

class TextAreaComponent extends React.Component<PassedProps, State> {
    constructor(props: PassedProps) {
        super(props);
        this.state = {
            text: ''
        };
    }

    componentDidMount() {
        let {section} = this.props;
        this.setState({text: section.value});
    }

    UNSAFE_componentWillReceiveProps(nextProps: PassedProps) {
        let {section} = nextProps;
        this.setState({
            text: section.value
        });
    }

    setText = (value: string) => {
        this.setState({text: value});
    };

    render() {
        let {section, storeSection, index} = this.props;
        let {text} = this.state;
        return (
            <IonTextarea
                style={{padding: '0px'}}
                value={text}
                rows={2}
                cols={20}
                placeholder="Text..."
                onIonChange={(e: any) => {
                    this.setText(e.detail.value);
                }}
                onIonBlur={() => {
                    section.value = text;
                    storeSection(index, section);
                }}
            />
        );
    }
}
export default TextAreaComponent;
