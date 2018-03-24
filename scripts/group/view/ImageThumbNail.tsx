import * as React from "react";
import { KeyCode } from "VSS/Utils/UI";
import { IImageAttachment } from "../../IImageAttachment";

export interface ImageThumbNailProps {
    image: IImageAttachment;
}

export class ImageThumbNail extends React.Component<ImageThumbNailProps, {}> {
    public render() {
        const { image } = this.props;
        return <a
            className="thumbnail-tile"
            href={image.url}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // tslint:disable-next-line:no-console
                console.log("todo show dialog");
            }}
            onKeyDown={(e) => {
                if (e.keyCode === KeyCode.ENTER) {
                    e.preventDefault();
                    e.stopPropagation();
                    // tslint:disable-next-line:no-console
                    console.log("todo show dialog");
                }
            }}
        >
            <div className="thumb-box">
                <img className="image-thumbnail" src={image.url} />
            </div>
            <div className="title">{image.attributes.name}</div>
        </a>;
    }
}
