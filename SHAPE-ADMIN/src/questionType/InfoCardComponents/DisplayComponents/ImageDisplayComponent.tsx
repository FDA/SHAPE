import React from "react";
import { isEmptyObject } from "../../../utils/Utils";
import { getImage } from "../../../utils/API";
import { InfoCardImageSection } from "../../../interfaces/DataTypes";

interface PassedProps {
    section: InfoCardImageSection;
}

interface State {
    imageSrc: string;
}

class ImageDisplayComponent extends React.Component<PassedProps, State> {
    private _isMounted = false;
    constructor(props: PassedProps) {
        super(props);
        this.state = {
            imageSrc: ""
        };
    }

    componentWillUnmount(): void {
        this._isMounted = false;
    }

    UNSAFE_componentWillMount() {
        let { section } = this.props;
        this._isMounted = true;
        if (!isEmptyObject(section.value) && !section.value.includes("data:image")) {
            getImage(section.value).then((res: any) => {
                if (this._isMounted) {
                    this.setState({
                        imageSrc: res.url
                    });
                }
            });
        }

        if (!isEmptyObject(section.value) && section.value.includes("data:image") && this._isMounted) {
            this.setState({
                imageSrc: section.value
            });
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps: PassedProps) {
        let { section } = nextProps;
        this._isMounted = true;
        if (!isEmptyObject(section.value) && !section.value.includes("data:image")) {
            getImage(section.value).then((res: any) => {
                if (this._isMounted) {
                    this.setState({
                        imageSrc: res.url
                    });
                }
            });
        }

        if (!isEmptyObject(section.value) && section.value.includes("data:image") && this._isMounted) {
            this.setState({
                imageSrc: section.value
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
