import * as React from "react";
import { KeyCode } from "VSS/Utils/UI";
import { showDialog } from "../../dialog/showDialog";
import { IImageAttachment } from "../../IImageAttachment";

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
            <div className="title">{image.attributes.name}</div>
        </a>;
    }
}
