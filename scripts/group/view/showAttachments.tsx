import { initializeIcons } from "office-ui-fabric-react/lib/Icons";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { DelayedFunction } from "VSS/Utils/Core";
import { IFileAttachment } from "../../IFileAttachment";
import { FileThumbnails } from "./FileThumbNails";

initializeIcons();

function resize() {
    const altMin = $(".callout").outerHeight();
    if (altMin > $(".main-content").outerHeight()) {
        VSS.resize(undefined, altMin + 16);
    } else {
        VSS.resize();
    }
}

function afterRender() {
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
    if (delayedStatus || !$(".status-message").text()) {
        delayedSetStatus.reset();
    } else {
        delayedSetStatus.invokeNow();
    }
    resize();
}
export function getStatus() {
    return delayedStatus;
}

export function setError(message: string) {
    setStatus("");
    $(".error-message").text(message);
    resize();
}

export function showAttachments(images: IFileAttachment[], newWi: boolean) {
    return new Promise<void>((resolve) => {
        ReactDOM.render(newWi ?
            <div>Save workitem to add attachments</div> :
            <FileThumbnails files={images}/>,
            document.getElementById("attachment-container"),
            () => {
                afterRender();
                resolve();
            },
        );
    });
}
