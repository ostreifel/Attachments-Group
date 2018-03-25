import * as React from "react";
import * as ReactDOM from "react-dom";
import { IImageAttachment } from "../IImageAttachment";
import { Gallery } from "./view/Gallery";

export function showGallery(images: IImageAttachment[], idx: number) {
    const container = document.getElementById("gallery-wrapper");
    ReactDOM.render(<Gallery images={images} idx={idx}/>, container);
}
