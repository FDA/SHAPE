import {IonAlert} from '@ionic/react';
import React from 'react';
import {isEmptyObject} from '../../../utils/Utils';
import {
    InfoCardImageSection,
    ImageMetadata
} from '../../../interfaces/DataTypes';

interface PassedProps {
    toggleImageSelector: Function;
    showImageSelector: boolean;
    section: InfoCardImageSection;
    index: number;
    storeSection: Function;
    images: Array<ImageMetadataObject>;
}

interface ImageMetadataObject {
    id: string;
    data: ImageMetadata;
}

class ImageBrowser extends React.Component<PassedProps, {}> {
    render() {
        let {
            toggleImageSelector,
            showImageSelector,
            section,
            index,
            storeSection,
            images
        } = this.props;
        return (
            <IonAlert
                isOpen={showImageSelector}
                onDidDismiss={() => toggleImageSelector()}
                header={'Select Image'}
                inputs={images.map((image: ImageMetadataObject) => {
                    return {
                        name: image.data.fileName,
                        type: 'radio',
                        label: image.data.fileName,
                        value: image.id
                    };
                })}
                buttons={[
                    {
                        text: 'Cancel',
                        role: 'cancel',
                        cssClass: 'secondary'
                    },
                    {
                        text: 'Ok',
                        handler: (selection: string) => {
                            if (!isEmptyObject(selection)) {
                                section.value = selection;
                                section.fileName = images.filter(
                                    (image: ImageMetadataObject) => {
                                        return image.id === selection;
                                    }
                                )[0].data.fileName;
                                storeSection(index, section);
                            }
                        }
                    }
                ]}
            />
        );
    }
}
export default ImageBrowser;
