import React, { Component } from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { setDarkMode, setPreviewMode } from "./redux/actions/Authentication";
import { connect } from "react-redux";
import { FirebaseAuth } from "./interfaces/DataTypes";
import App from "./App";

// To update the native build, do: <ios> <android>
// ionic build && ionic capacitor sync ios && ionic capacitor open ios
// > home > chooseQuestionnaire? surveyId > ChooseProfile? surveyId/q13Id > show questionnaire

interface AppProps extends RouteComponentProps {
  setPreviewModeDispatch: Function;
  fireBaseAuth: FirebaseAuth;
  previewMode: boolean;
  setDarkModeDispatch: Function;
  darkMode: boolean;
}

class AppContainer extends Component<AppProps, {}> {
  render() {
    const {
      setPreviewModeDispatch,
      fireBaseAuth,
      previewMode,
      setDarkModeDispatch,
      darkMode,
      history,
      location,
      match,
    } = this.props;

    return (
      <App
        setPreviewMode={setPreviewModeDispatch}
        fireBaseAuth={fireBaseAuth}
        previewMode={previewMode}
        setDarkMode={setDarkModeDispatch}
        darkMode={darkMode}
        history={history}
        location={location}
        match={match}
      />
    );
  }
}

// Map Redux state to component props
// makes store available to props
const mapStateToProps = (state: any) => ({
  fireBaseAuth: state.firebase.auth,
  previewMode: state.previewMode,
  displayPortal: state.displayPortal,
  darkMode: state.darkMode,
});

// Map Redux actions to component props
// maps changed props back to store
const mapDispatchToProps = (dispatch: any) => ({
  setPreviewModeDispatch(bool: boolean) {
    dispatch(setPreviewMode(bool));
  },
  setDarkModeDispatch(isDarkMode: boolean) {
    dispatch(setDarkMode(isDarkMode));
  },
});

// Connected Component
export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(AppContainer)
);
