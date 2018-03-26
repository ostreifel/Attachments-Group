import { AttachmentReference, WorkItem, WorkItemExpand } from "TFS/WorkItemTracking/Contracts";
import { getClient } from "TFS/WorkItemTracking/RestClient";
import { WorkItemFormService } from "TFS/WorkItemTracking/Services";
import { JsonPatchDocument, JsonPatchOperation, Operation } from "VSS/WebApi/Contracts";
import { IProperties, trackEvent } from "../events";
import { IImageAttachment } from "../IImageAttachment";
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
        images: images.length + "",
    };
}

let images: IImageAttachment[] = [];

const imageRegex = /\.jpe?g$|\.gif$|\.png$|\.bmp$|\.png$/i;
async function update(wi: WorkItem) {
    images = (wi.relations || []).filter((r) =>
        r.rel === "AttachedFile" && imageRegex.test(r.attributes.name),
    ) as IImageAttachment[];
    showImages(images);
}

export async function refreshImages(): Promise<void> {
    tryExecute(async () => {
        trackEvent("refresh", {new: "false", ...getProps()});
        const formService = await WorkItemFormService.getService();
        const id = await formService.getId();
        const wi = await getClient().getWorkItem(id, undefined, undefined, WorkItemExpand.Relations);
        update(wi);
    });
}

export async function addFiles(files: FileList) {
    if (!files || files.length === 0) {
        return;
    }
    trackEvent("add", {adding: files.length + "", ...getProps()});
    const readerPromises: IPromise<AttachmentReference>[] = [];
    for (let i = 0; i < files.length; i++) {
        const file = files.item(i);
        readerPromises.push(getClient().createAttachment(file, file.name));
    }
    const refs = await Promise.all(readerPromises);
    const formService = await WorkItemFormService.getService();
    const id = await formService.getId();
    const patch: JsonPatchDocument & JsonPatchOperation[] = refs.map((ref): JsonPatchOperation => (
        {
            op: Operation.Add,
            path: "/relations/-",
            value: {
                rel: "AttachedFile",
                url: ref.url,
                attributes: {
                    comment: "Created from the image group extension",
                },
            },
        } as JsonPatchOperation
    ));

    const wi = await getClient().updateWorkItem(patch, id);
    await update(wi);
}

export async function deleteImage(image: IImageAttachment) {
    const dialogService = await VSS.getService(VSS.ServiceIds.Dialog) as IHostDialogService;
    return dialogService.openMessageDialog(`Permanently delete ${image.attributes.name}?`)
    .then(async () => {
        const formService = await WorkItemFormService.getService();
        const id = await formService.getId();
        const wi = await getClient().getWorkItem(id, undefined, undefined, WorkItemExpand.Relations);
        const idx = (wi.relations || []).map(({url}) => url).indexOf(image.url);
        if (idx < 0) {
            return;
        }
        const patch: JsonPatchDocument & JsonPatchOperation[] = [
            {
                op: Operation.Remove,
                path: `/relations/${idx}`,
            } as JsonPatchOperation,
        ];
        const updated = await getClient().updateWorkItem(patch, id);
        update(updated);
    });
}
