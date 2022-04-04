import {Redirect, Route, RouteProps} from 'react-router';
import React from 'react';
import {routes} from '../utils/Constants';

interface ProtectedRouteProps extends RouteProps {
    isAuth: boolean;
    component: any;
    path: string;
}
const ProtectedRoute: React.FC<ProtectedRouteProps> = (
    props: ProtectedRouteProps
) => {
    return props.isAuth ? (
        <Route {...props} component={props.component} path={props.path} />
    ) : (
        <Redirect to={routes.LOGIN} />
    );
};

export default ProtectedRoute;
