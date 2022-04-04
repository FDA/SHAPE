import React from "react";
import ReactDOM from "react-dom";
import { routes } from "../utils/Constants";

interface PassedProps {
  children: any;
}

interface WindowPortalState {
  externalWindow: any;
  containerEl: any;
}

class WindowPortal extends React.Component<PassedProps, WindowPortalState> {
  constructor(props: PassedProps) {
    super(props);
    this.state = {
      externalWindow: null,
      containerEl: null,
    };
  }

  handleResize = () => {
    this.state.externalWindow.resizeTo(400, 828);
  };

  componentDidMount() {
    // STEP 1: Create a new window, a div, and append it to the window. The div
    // *MUST** be created by the window it is to be appended to (Edge only)
    let externalWindow = window.open(
      "",
      "",
      "resizeable=0,width=400,height=828,left=200,top=200"
    );
    let containerEl = document.createElement("div");
    if (externalWindow) {
      externalWindow.addEventListener("resize", this.handleResize);
      externalWindow.document.title = "Shape Window Portal";
      externalWindow.location.replace(routes.TABS);
      externalWindow.document.body.appendChild(containerEl);
    }
    this.setState({
      externalWindow,
      containerEl,
    });
  }

  componentWillUnmount() {
    // STEP 2: This will fire when this.state.showWindowPortal in the parent component
    // becomes false so we tidy up by just closing the window
    this.state.externalWindow.removeEventListener("resize", this.handleResize);
    this.state.externalWindow.close();
  }

  render() {
    // STEP 3: The first render occurs before componentDidMount (where we open the
    // new window) so container may be null, in this case render nothing.
    if (!this.state.containerEl) {
      return null;
    }

    // STEP 4: Append props.children to the container <div> in the new window
    return ReactDOM.createPortal(this.props.children, this.state.containerEl);
  }
}

export default WindowPortal;
