import * as React from "react";
import * as ReactDOM from "react-dom";
import { DelayedFunction } from "VSS/Utils/Core";
import { IImageAttachment } from "../../IImageAttachment";
import { ImageThumbnails } from "./ImageThumbNails";

function resize() {
    const altMin = $(".callout").outerHeight();
    if (altMin > $(".main-content").outerHeight()) {
        VSS.resize(undefined, altMin + 16);
    } else {
        VSS.resize();
    }
}

function afterRender() {
    $("#links-container .link .checkbox").attr("data-is-focusable", "false").attr("tab-index", -1);

    setStatus("");
    resize();
}

let delayedStatus: string = "";
/** don't want status flashing in and out for quick changes */
const delayedSetStatus: DelayedFunction = new DelayedFunction(null, 500, "", () => {
    $(".status-message").text(delayedStatus);
    resize();
});
export function setStatus(message: string) {
    $(".error-message").text("");
    delayedStatus = message;
    if (delayedStatus) {
        delayedSetStatus.reset();
    } else {
        delayedSetStatus.invokeNow();
    }
    resize();
}

export function setError(message: string) {
    $(".error-message").text(message);
    resize();
}

export function showImages(images: IImageAttachment[]) {
    return new Promise<void>((resolve) => {
        ReactDOM.render(<ImageThumbnails images={images}/>, document.getElementById("image-container"), () => {
            afterRender();
            resolve();
        });
    });
}
