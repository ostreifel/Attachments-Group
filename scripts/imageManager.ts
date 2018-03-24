import { /*WorkItem, */WorkItemExpand } from "TFS/WorkItemTracking/Contracts";
import { getClient } from "TFS/WorkItemTracking/RestClient";
import { WorkItemFormService } from "TFS/WorkItemTracking/Services";
import { IProperties, trackEvent } from "./events";
import { IImageAttachment } from "./IImageAttachment";
import { setError, setStatus, showImages } from "./view/showImages";

async function tryExecute(callback: () => Promise<void>) {
    try {
        await callback();
        setStatus("");
    } catch (error) {
        const message = (
            typeof error === "string" ? error : (error.serverError || error || {}).message
        ) ||
        error + "" ||
        "unknown error";

        // tslint:disable-next-line:no-console
        console.error(error);
        trackEvent("error", {message, ...getProps()});
        setError(message);
    }
}

function getProps(): IProperties {
    return {
        // wiCount: Object.keys(wis).length + "",
        // relCount: rels.length + "",
    };
}

let images: IImageAttachment[];

const imageRegex = /\.jpe?g$|\.gif$|\.png$|\.bmp$|\.png$/i;
export async function refreshImages(): Promise<void> {
    tryExecute(async () => {
        trackEvent("refresh", {new: "false", ...getProps()});
        const formService = await WorkItemFormService.getService();
        const id = await formService.getId();
        const wi = await getClient().getWorkItem(id, undefined, undefined, WorkItemExpand.Relations);
        images = wi.relations.filter((r) =>
            r.rel === "AttachedFile" && imageRegex.test(r.attributes.name),
        ) as IImageAttachment[];
        showImages(images);
    });
}
