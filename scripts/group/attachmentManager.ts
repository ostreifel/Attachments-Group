import { AttachmentReference, WorkItem, WorkItemExpand } from "TFS/WorkItemTracking/Contracts";
import { getClient } from "TFS/WorkItemTracking/RestClient";
import { WorkItemFormService } from "TFS/WorkItemTracking/Services";
import * as Utils_Date from "VSS/Utils/Date";
import { JsonPatchDocument, JsonPatchOperation, Operation } from "VSS/WebApi/Contracts";
import { IProperties, trackEvent } from "../events";
import { IFileAttachment } from "../IFileAttachment";
import { isImageFile } from "../isImageFile";
import { setError, setStatus, showAttachments } from "./view/showAttachments";

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

export function getProps(): IProperties {
    return {
        attachments: attachments.length + "",
        images: attachments.filter(isImageFile).length + "",
    };
}

let attachments: IFileAttachment[] = [];

async function update(wi: WorkItem) {
    attachments = (wi.relations || []).filter((r) =>
        r.rel === "AttachedFile",
    ) as IFileAttachment[];
    attachments.sort((a, b) => {
        const comp = (v1, v2) => {
            if (v1 < v2) {
                return -1;
            } else if (v1 > v2) {
                return 1;
            }
            return 0;
        };
        return comp(
            Utils_Date.parseDateString(a.attributes.resourceCreatedDate),
            Utils_Date.parseDateString(b.attributes.resourceCreatedDate),
        ) || comp(
            Utils_Date.parseDateString(a.attributes.authorizedDate),
            Utils_Date.parseDateString(b.attributes.authorizedDate),
        ) || comp(
            a.attributes.name,
            b.attributes.name,
        ) || comp(
            a.attributes.id,
            b.attributes.id,
        );
    });
    showAttachments(attachments);
}

export async function refreshAttachments(): Promise<void> {
    tryExecute(async () => {
        trackEvent("refresh", {new: "false", ...getProps()});
        const formService = await WorkItemFormService.getService();
        const id = await formService.getId();
        setStatus("Refreshing attachments...");
        const wi = await getClient().getWorkItem(id, undefined, undefined, WorkItemExpand.Relations);
        update(wi);
    });
}

export async function addFiles(trigger: string, files: FileList) {
    if (!files || files.length === 0) {
        return;
    }
    tryExecute(async () => {
        trackEvent("add", {trigger, adding: files.length + "", ...getProps()});
        const readerPromises: IPromise<AttachmentReference>[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files.item(i);
            readerPromises.push(getClient().createAttachment(file, file.name));
        }
        setStatus("Creating attachments...");
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
                    },
                },
            } as JsonPatchOperation
        ));
        setStatus("Adding attachments...");
        const wi = await getClient().updateWorkItem(patch, id);
        await update(wi);
    });
}

export async function deleteAttachment(trigger: string, file: IFileAttachment) {
    const dialogService = await VSS.getService(VSS.ServiceIds.Dialog) as IHostDialogService;
    return dialogService.openMessageDialog(`Permanently delete ${file.attributes.name}?`)
    .then(() => {
        tryExecute(async () => {
            trackEvent("delete", {trigger, ...getProps()});
            const formService = await WorkItemFormService.getService();
            const id = await formService.getId();
            const wi = await getClient().getWorkItem(id, undefined, undefined, WorkItemExpand.Relations);
            const idx = (wi.relations || []).map(({url}) => url).indexOf(file.url);
            if (idx < 0) {
                return;
            }
            const patch: JsonPatchDocument & JsonPatchOperation[] = [
                {
                    op: Operation.Remove,
                    path: `/relations/${idx}`,
                } as JsonPatchOperation,
            ];
            setStatus("Removing attachment...");
            const updated = await getClient().updateWorkItem(patch, id);
            await update(updated);
        });
    });
}
