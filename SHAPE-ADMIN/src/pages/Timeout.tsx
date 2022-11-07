/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {useIdleTimer} from 'react-idle-timer';
import {IonToast} from '@ionic/react';
import {logout} from '../redux/actions/Authentication';

import {connect} from 'react-redux';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

interface Props {
    logoutDispatch: Function;
    loggedIn: boolean;
}

const Timeout: React.FC<Props> = (props: Props) => {
    const timeout = 30 * 60 * 1000; // 30 minutes
    const [isIdle, setIsIdle] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [remaining, setRemaining] = useState(timeout);
    const handleOnActive = () => setIsIdle(false);
    const handleOnIdle = () => {
        if (process.env.NODE_ENV !== 'development') {
            setIsIdle(true);
        } else {
            console.log(
                `Idle timer timed out, would be logging you out if not in development mode.`
            );
        }
    };
    const handleOnAction = () => {
        const auth = getAuth();
        onAuthStateChanged(auth, async (activeUser) => {
            if (activeUser) {
                let currentExpirationTime = JSON.parse(
                    localStorage.getItem('user')
                );
                let now = new Date().getTime();
                let expirationDate = new Date(currentExpirationTime).getTime();
                if (now - expirationDate >= 0) {
                    activeUser.getIdToken().then(function () {
                        let userJSON = JSON.parse(JSON.stringify(activeUser));
                        localStorage.setItem(
                            'user',
                            userJSON.stsTokenManager.expirationTime
                        );
                    });
                }
            }
        });
    };

    const onDismissed = () => {
        if (isIdle) {
            props.logoutDispatch();
            // eslint-disable-next-line no-restricted-globals
            location.reload();
        }
    };

    const {getRemainingTime} = useIdleTimer({
        timeout,
        onActive: handleOnActive,
        onIdle: handleOnIdle,
        onAction: handleOnAction
    });

    useEffect(() => {
        setRemaining(getRemainingTime());

        setInterval(() => {
            setRemaining(getRemainingTime());
        }, 1000);
    }, []);

    return (
        <div>
            <IonToast
                id={'timeout-toast'}
                isOpen={isIdle && props.loggedIn}
                onDidDismiss={() => onDismissed()}
                message="You are about to be logged out. Move your mouse or press any key to extend your session."
                duration={60 * 1000} // one minute
                position={'top'}
                color={'danger'}
            />
        </div>
    );
};

const mapStateToProps = (state: any) => ({
    loggedIn: state.authentication.loggedIn
});

const mapDispatchToProps = (dispatch: any) => ({
    logoutDispatch() {
        dispatch(logout());
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(Timeout);
