import React, { Component } from "react";
import PrivatePublicQuery from "../PrivatePublicQuery";

interface PassedProps {}

interface PrivatePublicQueryContainerState {}

class PrivatePublicQueryContainer extends Component<
  PassedProps,
  PrivatePublicQueryContainerState
> {
  render() {
    return (
      <PrivatePublicQuery/>
    );
  }
}

export default PrivatePublicQueryContainer;
