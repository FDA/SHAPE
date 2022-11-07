import React from "react";
import { isEmptyObject } from "../../../../utils/Utils";
import { InfoCardImageSection } from "../../../../interfaces/DataTypes";
import { getDownloadURL, getStorage, ref } from "firebase/storage";

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
    const fbStorage = getStorage();
    const storageRef = ref(fbStorage, `${org}`);
    const fileRef = ref(storageRef, `/image/${storageId}`);
    return getDownloadURL(fileRef);
  }

  UNSAFE_componentWillMount() {
    const { section, org } = this.props;
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
    const { section, org } = nextProps;
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
    const { imageSrc } = this.state;

    if (!isEmptyObject(imageSrc)) {
      return <img alt={"info"} src={imageSrc} />;
    }
    return null;
  }
}
export default ImageDisplayComponent;
