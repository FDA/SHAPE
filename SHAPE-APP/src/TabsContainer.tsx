import React, { Component } from "react";
import { connect } from "react-redux";
import { ParticipantResponse, User } from "./interfaces/DataTypes";
import Tabs from "./Tabs";
import { RouteComponentProps } from "react-router";

interface MainTabsProps extends RouteComponentProps {
  firebaseLoggedIn: boolean;
  prefersDarkMode: boolean;
  participantResponse: Array<ParticipantResponse>;
  profile: User;
}

class TabsContainer extends Component<MainTabsProps, {}> {
  render() {
    let {
      firebaseLoggedIn,
      prefersDarkMode,
      participantResponse,
      profile,
      history,
      location,
      match,
    } = this.props;
    return (
      <Tabs
        firebaseLoggedIn={firebaseLoggedIn}
        prefersDarkMode={prefersDarkMode}
        participantResponse={participantResponse}
        profile={profile}
        history={history}
        location={location}
        match={match}
      />
    );
  }
}

const mapStateToProps = (state: any) => ({
  participantResponse: state.participantResponse,
  profile: state.firebase.profile,
});

const mapDispatchToProps = (dispatch: any) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(TabsContainer);
