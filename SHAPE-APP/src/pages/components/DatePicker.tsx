import React, { Component } from 'react';
import {
    IonButton,
    IonButtons,
    IonDatetime,
    IonDatetimeButton,
    IonItem,
    IonLabel,
    IonModal,
    IonText,
    IonToast
} from '@ionic/react';
import { dateFormats } from '../../utils/Constants';
import { format, isAfter, isBefore } from 'date-fns';

interface PassedProps {
    setDate: Function;
    date: any;
    name: string;
    min?: string;
    max?: string;
    disabled?: boolean;
    label?: string;
    required?: boolean;
}

interface State {
    error: boolean;
    errorMessage: string;
}

class DatePicker extends Component<PassedProps, State> {
    constructor(props: PassedProps) {
        super(props);
        this.state = {
            error: false,
            errorMessage: ''
        };
    }

    validate = (value: string) => {
        const { name, min, max } = this.props;
        if (value) {
            try {
                const date = new Date(value);
                if (min) {
                    const minDate = new Date(min);
                    if (isBefore(date, minDate)) {
                        this.toggleError(`${name} must be after: ${format(minDate, dateFormats.MMddyyyy)}`);
                        return false;
                    }
                }
                if (max) {
                    const maxDate = new Date(max);
                    if (isAfter(date, maxDate)) {
                        this.toggleError(`${name} must be before: ${format(maxDate, dateFormats.MMddyyyy)}`);
                        return false;
                    }
                }
                return format(date, dateFormats.MMddyyyy);
            } catch (e) {
                console.log(e);
                this.toggleError('invalid date');
            }
        }
        return false;
    };

    toggleError = (msg: string) => {
        this.setState({
            error: !this.state.error,
            errorMessage: msg
        });
    };

    setValue = (date: string) => {
        const validDate = this.validate(date);

        if (validDate) {
            const event = {
                target: {
                    name: this.props.name,
                    value: validDate
                }
            };
            return this.props.setDate(event);
        }
    };

    clearValue = () => {
        const event = {
            target: {
                name: this.props.name,
                value: null
            }
        };
        return this.props.setDate(event);
    };

    render() {
        const { date, min, max, disabled, label, required, name } = this.props;
        const { error, errorMessage } = this.state;
        return (
            <>
                <IonLabel position='stacked' color={disabled ? 'medium' : ''}>
                    {label}
                    {required && <IonText color='danger'>*</IonText>}
                </IonLabel>
                <IonItem className='rounded-input' lines='none'>
                    <IonDatetimeButton datetime={name}>
                        <IonText slot='date-target'>
                            {date ? format(new Date(date), dateFormats.MMddyyyy) : 'click to select'}
                        </IonText>
                    </IonDatetimeButton>
                    {date && (
                        <IonButtons slot='end'>
                            <IonButton onClick={() => this.clearValue()}>clear</IonButton>
                        </IonButtons>
                    )}
                </IonItem>
                <IonModal keepContentsMounted className='rounded-modal'>
                    <IonDatetime
                        id={name}
                        presentation='date'
                        preferWheel
                        value={date && new Date(date).toISOString()}
                        onIonChange={(e) => this.setValue(e.detail.value as string)}
                        min={min}
                        max={max}
                    />
                </IonModal>

                <IonToast
                    color='danger'
                    isOpen={error}
                    duration={2500}
                    onWillDismiss={() => this.toggleError('')}
                    message={errorMessage}
                />
            </>
        );
    }
}

export default DatePicker;
