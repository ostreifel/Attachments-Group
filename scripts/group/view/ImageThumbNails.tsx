import * as React from "react";
import { IImageAttachment } from "../../IImageAttachment";
import { ImageThumbNail } from "./ImageThumbNail";

export interface IImageThumbNailsProps {
    images: IImageAttachment[];
}
export class ImageThumbnails extends React.Component<IImageThumbNailsProps, {}> {
    public render() {
        return <div className="image-thumbnails">
            {this.props.images.map((i) => <ImageThumbNail image={i} />)}
        </div>;
    }
}
