import * as React from "react";
import { IImageAttachment } from "../IImageAttachment";

export interface ImageThumbNailProps {
    image: IImageAttachment;
}

export class ImageThumbNail extends React.Component<ImageThumbNailProps, {}> {
    public render() {
        return <img className="image-thumbnail" src={this.props.image.url} />;
    }
}
