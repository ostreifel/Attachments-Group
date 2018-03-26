import { FocusZone } from "office-ui-fabric-react/lib/components/FocusZone";
import * as React from "react";
import { IImageAttachment } from "../../IImageAttachment";
import { AddImage } from "./AddImage";
import { ImageThumbNail } from "./ImageThumbNail";

export interface IImageThumbNailsProps {
    images: IImageAttachment[];
}
export class ImageThumbnails extends React.Component<IImageThumbNailsProps, {}> {
    public render() {
        const {images} = this.props;
        return <FocusZone className="image-thumbnails">
            {images.map((_, idx) => <ImageThumbNail images={images} idx={idx} />)}
            <AddImage />
        </FocusZone>;
    }
}
