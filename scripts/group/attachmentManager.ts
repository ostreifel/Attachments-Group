import { AttachmentReference, WorkItem, WorkItemExpand } from "TFS/WorkItemTracking/Contracts";
import { getClient } from "TFS/WorkItemTracking/RestClient";
import { WorkItemFormService } from "TFS/WorkItemTracking/Services";
import { JsonPatchDocument, JsonPatchOperation, Operation } from "VSS/WebApi/Contracts";
import { IProperties, trackEvent } from "../events";
import { IFileAttachment } from "../IFileAttachment";
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

function getProps(): IProperties {
    return {
        attachments: attachments.length + "",
    };
}

let attachments: IFileAttachment[] = [];

async function update(wi: WorkItem) {
    attachments = (wi.relations || []).filter((r) =>
        r.rel === "AttachedFile",
    ) as IFileAttachment[];
    showAttachments(attachments);
}

export async function refreshAttachments(): Promise<void> {
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
    tryExecute(async () => {
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
                    },
                },
            } as JsonPatchOperation
        ));

        const wi = await getClient().updateWorkItem(patch, id);
        await update(wi);
    });
}

export async function deleteAttachment(file: IFileAttachment) {
    const dialogService = await VSS.getService(VSS.ServiceIds.Dialog) as IHostDialogService;
    return dialogService.openMessageDialog(`Permanently delete ${file.attributes.name}?`)
    .then(() => {
        tryExecute(async () => {
            trackEvent("delete", {...getProps()});
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
            const updated = await getClient().updateWorkItem(patch, id);
            await update(updated);
        });
    });
}
