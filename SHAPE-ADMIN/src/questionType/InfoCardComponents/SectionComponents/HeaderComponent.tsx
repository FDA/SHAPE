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

class HeaderComponent extends React.Component<PassedProps, State> {
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

    UNSAFE_componentWillReceiveProps(nextProps: any) {
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
                rows={1}
                style={{padding: '0px'}}
                placeholder="Header..."
                value={text}
                onIonChange={(e: any) => {
                    this.setText(e.detail.value);
                }}
                onIonBlur={(e: any) => {
                    section.value = text;
                    storeSection(index, section);
                }}
            />
        );
    }
}
export default HeaderComponent;
