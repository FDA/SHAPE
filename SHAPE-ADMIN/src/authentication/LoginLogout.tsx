import React, {Component, SyntheticEvent} from 'react';
import {connect} from 'react-redux';
import {withStyles} from '@material-ui/core/styles';
import {logout} from '../redux/actions/Authentication';
import {IonButton} from '@ionic/react';
import {withRouter, RouteComponentProps} from 'react-router-dom';
import {routes} from '../utils/Constants';

const styles = () => ({
    button: {
        margin: '6px',
        padding: '6px',
        borderColor: 'blue',
        color: 'blue'
    },
    input: {
        display: 'none'
    }
});

interface PassedProps extends RouteComponentProps {
    logout: Function;
    loggedIn: boolean;
}

interface State {}

class LoginLogout extends Component<PassedProps, State> {
    handleLogoutClick = (event: SyntheticEvent) => {
        let parent = this;
        localStorage.removeItem('user');
        this.props.logout();
        parent.props.history.push({pathname: routes.LOGIN});
    };

    render() {
        const {loggedIn} = this.props;
        return (
            <span>
                {loggedIn && (
                    <IonButton
                        id="logout"
                        style={{margin: '12px'}}
                        onClick={this.handleLogoutClick}>
                        Logout
                    </IonButton>
                )}
            </span>
        );
    }
}

const mapStateToProps = (state: any) => ({
    loggedIn: state.authentication.loggedIn
});

const mapDispatchToProps = (dispatch: any) => ({
    logout() {
        dispatch(logout());
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(withRouter(LoginLogout)));
