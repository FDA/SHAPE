import React from 'react';
import imageCompression from 'browser-image-compression';
import ImageBrowser from './ImageBrowser';
import {isEmptyObject} from '../../../utils/Utils';
import {getAllImageMetadata} from '../../../utils/API';
import {
    InfoCardImageSection,
    ImageMetadata
} from '../../../interfaces/DataTypes';

interface PassedProps {
    section: InfoCardImageSection;
    storeSection: Function;
    index: number;
}

interface State {
    text: string;
    showImageSelector: boolean;
    listOfImages: Array<ImageMetadataObject>;
}

interface ImageMetadataObject {
    id: string;
    data: ImageMetadata;
}

class ImageComponent extends React.Component<PassedProps, State> {
    constructor(props: PassedProps) {
        super(props);
        this.state = {
            text: '',
            showImageSelector: false,
            listOfImages: []
        };
    }

    componentDidMount() {
        let {section} = this.props;
        this.setState({text: section.value});
    }

    UNSAFE_componentWillReceiveProps(nextProps: PassedProps) {
        let {section} = nextProps;
        this.setState({
            text: section.value
        });
    }

    toggleImageSelector = () => {
        this.setState({
            showImageSelector: !this.state.showImageSelector
        });
    };

    getListOfImages = () => {
        getAllImageMetadata().then((res: Array<ImageMetadataObject>) => {
            this.setState({
                listOfImages: res
            });
            this.toggleImageSelector();
        });
    };

    handleImageUpload = (event: any) => {
        let {section, storeSection, index} = this.props;

        var imageFile = event.target.files[0];

        var options = {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 1920,
            useWebWorker: true
        };
        imageCompression(imageFile, options)
            .then(function (compressedFile) {
                var reader = new FileReader();
                reader.readAsDataURL(compressedFile);
                reader.onloadend = function () {
                    var base64data = reader.result;
                    section.value = base64data as string;
                    section.fileName = imageFile.name;
                    storeSection(index, section);
                };
            })
            .catch(function (error) {
                console.error(error.message);
            });
    };

    render() {
        let {showImageSelector, listOfImages} = this.state;
        let {index, section, storeSection} = this.props;
        return (
            <>
                <div>
                    <label
                        htmlFor="imageUploader"
                        style={{color: '#007cba', fontStyle: 'italic'}}>
                        {!isEmptyObject(section.fileName)
                            ? `Current image: ${section.fileName}`
                            : ''}
                    </label>
                    <input
                        id="imageUploader"
                        type="file"
                        accept="image/*"
                        onChange={(event: any) => this.handleImageUpload(event)}
                        placeholder="file here"
                    />
                    <span>
                        <button
                            type="button"
                            onClick={() => {
                                this.getListOfImages();
                            }}>
                            Browse
                        </button>
                    </span>
                </div>
                <ImageBrowser
                    toggleImageSelector={this.toggleImageSelector}
                    showImageSelector={showImageSelector}
                    section={section}
                    index={index}
                    storeSection={storeSection}
                    images={listOfImages}
                />
            </>
        );
    }
}
export default ImageComponent;
