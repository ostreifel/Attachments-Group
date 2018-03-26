import { IconButton } from "office-ui-fabric-react/lib/Button";
import * as React from "react";
import { KeyCode } from "VSS/Utils/UI";
import { showDialog } from "../../dialog/showDialog";
import { IImageAttachment } from "../../IImageAttachment";
import { deleteImage } from "../imageManager";

export interface ImageThumbNailProps {
    idx: number;
    images: IImageAttachment[];
}

export class ImageThumbNail extends React.Component<ImageThumbNailProps, {}> {
    public render() {
        const { images, idx } = this.props;
        const image = images[idx];
        const imageUrl = `${image.url}?filename=${image.attributes.name}`;
        return <a
            className="thumbnail-tile"
            href={imageUrl}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                showDialog(images, idx);
            }}
            onKeyDown={(e) => {
                if (e.keyCode === KeyCode.ENTER) {
                    e.preventDefault();
                    e.stopPropagation();
                    showDialog(images, idx);
                }
            }}
        >
            <div className="thumb-box">
                <img className="image-thumbnail" src={imageUrl} />
            </div>
            <div className="title">
                <div className="text">{image.attributes.name}</div>
                <IconButton
                    className="delete-button"
                    iconProps={{iconName: "Delete"}}
                    title="Delete"
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        deleteImage(image);
                    }}
                />
            </div>
        </a>;
    }
}
