import * as React from "react";
import * as ReactDOM from "react-dom";
import { Gallery, IGalleryProps } from "./view/Gallery";

export function showGallery(props: IGalleryProps) {
    return new Promise((resolve) => {
        const container = document.getElementById("gallery-wrapper");
        ReactDOM.render(<Gallery {...props}/>, container, () => {
            resolve();
        });
    });
}
