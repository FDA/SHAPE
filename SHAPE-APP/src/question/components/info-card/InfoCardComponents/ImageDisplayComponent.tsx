import React from "react";
import { isEmptyObject } from "../../../../utils/Utils";
import * as firebase from "firebase";
import { InfoCardImageSection } from "../../../../interfaces/DataTypes";

interface PassedProps {
  section: InfoCardImageSection;
  org: string;
}

interface ImageDisplayComponentState {
  imageSrc: string;
}

class ImageDisplayComponent extends React.Component<
  PassedProps,
  ImageDisplayComponentState
> {
  constructor(props: PassedProps) {
    super(props);
    this.state = {
      imageSrc: "",
    };
  }

  getImage(org: string, storageId: string) {
    var storage = firebase.storage();
    var storageRef = storage.ref(`${org}`);
    return storageRef.child(`/image/${storageId}`).getDownloadURL();
  }

  UNSAFE_componentWillMount() {
    let { section, org } = this.props;
    if (
      !isEmptyObject(section.value) &&
      !section.value.includes("data:image")
    ) {
      this.getImage(org, section.value).then((res: string) => {
        this.setState({
          imageSrc: res,
        });
      });
    }

    if (!isEmptyObject(section.value) && section.value.includes("data:image")) {
      this.setState({
        imageSrc: section.value,
      });
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps: PassedProps) {
    let { section, org } = nextProps;
    if (
      !isEmptyObject(section.value) &&
      !section.value.includes("data:image")
    ) {
      this.getImage(org, section.value).then((res: string) => {
        this.setState({
          imageSrc: res,
        });
      });
    }

    if (!isEmptyObject(section.value) && section.value.includes("data:image")) {
      this.setState({
        imageSrc: section.value,
      });
    }
  }

  render() {
    let { imageSrc } = this.state;

    if (!isEmptyObject(imageSrc)) {
      return <img alt={"info"} src={imageSrc} />;
    }
    return null;
  }
}
export default ImageDisplayComponent;
