import { AttachmentReference, WorkItem, WorkItemExpand } from "TFS/WorkItemTracking/Contracts";
import { getClient } from "TFS/WorkItemTracking/RestClient";
import { WorkItemFormService } from "TFS/WorkItemTracking/Services";
import * as Utils_Date from "VSS/Utils/Date";
import { JsonPatchDocument, JsonPatchOperation, Operation } from "VSS/WebApi/Contracts";

import { IProperties, trackEvent } from "../events";
import { fileNameParts, getFileExtension, isImageFile } from "../fileType";
import { IFileAttachment } from "../IFileAttachment";
import { getStatus, setError, setStatus, showAttachments } from "./view/showAttachments";

export async function tryExecute(callback: () => Promise<void>) {
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
        trackEvent("error", {message, stack: error && error.stack, status: getStatus(), ...getProps()});
        setError(message);
    }
}

export function getProps(files?: IFileAttachment | IFileAttachment[]): IProperties {
    if (files && !(files instanceof Array)) {
        files = [files];
    }
    const fileProps: IProperties = files ? {
        selected: files.length + "",
        fromParent: files.map((f) => !!f.fromParent + "").join(" "),
        ext: files.map((f) => getFileExtension(f.attributes.name) || "").join(" "),
    } : {};
    return {
        ...fileProps,
        attachments: attachments.length + "",
        parentAttachments: attachments.filter((a) => a.fromParent).length + "",
        images: attachments.filter(isImageFile).length + "",
    };
}

function wiIdFromUrl(url: string): number {
    const match = url.match(/workitems\/(\d+)$/i);
    return match ? Number(match[1]) : -1;
}

let attachments: IFileAttachment[] = [];
let currentWi: WorkItem | null = null;
let parent: WorkItem | null = null;

async function update(wi?: WorkItem) {
    setStatus("Drawing attachment previews...");
    if (wi) {
        currentWi = wi;
        attachments = [
            ...((parent && parent.relations || []).filter((r) =>
                r.rel === "AttachedFile",
            ) as IFileAttachment[]).map((a) => ({...a, fromParent: true})),
            ...(wi.relations || []).filter((r) =>
                r.rel === "AttachedFile",
            ) as IFileAttachment[],
        ];
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
                a.fromParent ? 0 : 1,
                b.fromParent ? 0 : 1,
            ) || comp(
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
    } else {
        attachments = [];
    }
    await showAttachments(attachments, !wi);
}

export async function refreshAttachments(): Promise<void> {
    tryExecute(async () => {
        const formService = await WorkItemFormService.getService();
        const id = await formService.getId();
        if (id === 0) {
            setStatus("Rendering for new work item...");
            update();
        } else {
            setStatus("Refreshing attachments...");
            const wi = await getClient().getWorkItem(id, undefined, undefined, WorkItemExpand.Relations);
            const [parentRel] = (wi.relations || []).filter(({rel}) => rel === "System.LinkTypes.Hierarchy-Reverse");
            setStatus("Refreshing parent...");
            parent = parentRel && await getClient().getWorkItem(
                wiIdFromUrl(parentRel.url),
                undefined,
                undefined,
                WorkItemExpand.Relations,
            );
            await update(wi);
        }
        trackEvent("refresh", {new: (id === 0) + "", ...getProps()});
    });
}

export async function addFiles(trigger: string, files: FileList) {
    if (!files || files.length === 0) {
        return;
    }
    tryExecute(async () => {
        const exts: string[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files.item(i);
            if (!file) { continue; }
            const ext = getFileExtension(file.name);
            if (!ext) { continue; }
            exts.push(ext);
        }
        trackEvent("add", {trigger, adding: files.length + "", exts: exts.join(" "), ...getProps()});
        const readerPromises: IPromise<AttachmentReference>[] = [];
        setStatus("Creating attachments...");
        for (let i = 0; i < files.length; i++) {
            const file = files.item(i);
            if (!file) { continue; }
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
        setStatus("Adding attachments...");
        const wi = await getClient().updateWorkItem(patch, id);
        await update(wi);
    });
}

async function getWiId(file: IFileAttachment): Promise<number> {
    const formService = await WorkItemFormService.getService();
    const id = file.fromParent ? (parent as WorkItem).id : await formService.getId();
    return id;
}

async function getIdx(id: number, file: IFileAttachment): Promise<number> {
    const wi = await getClient().getWorkItem(id, undefined, undefined, WorkItemExpand.Relations);
    const idx = (wi.relations || []).map(({url}) => url).indexOf(file.url);
    return idx;
}

async function getIdxes(id: number, files: IFileAttachment[]): Promise<number[]> {
    const wi = await getClient().getWorkItem(id, undefined, undefined, WorkItemExpand.Relations);
    const urls: {[url: string]: number} = {};
    wi.relations.forEach((rel, i) => urls[rel.url] = i);
    return files.map((f) => urls[f.url]).filter((idx) => typeof idx === "number");
}

export async function deleteAttachments(trigger: string, files: IFileAttachment[]) {
    return tryExecute(async () => {
        const dialogService = await VSS.getService(VSS.ServiceIds.Dialog) as IHostDialogService;
        try {
            await dialogService.openMessageDialog(`Permanently delete ${
                files.map((f) => f.attributes.name).join(", ")
            }?`);
        } catch {
            return;
        }

        async function deleteFiles(id: number | null, wiFiles: IFileAttachment[]): Promise<WorkItem | null> {
            if (!id || wiFiles.length === 0) {
                return null;
            }
            setStatus("Getting work item to remove attachment(s) from...");
            const idxes = await getIdxes(id, wiFiles);
            if (idxes.length === 0) {
                return null;
            }
            setStatus("Removing attachment(s)...");
            const patch: JsonPatchDocument & JsonPatchOperation[] = idxes.map((idx) =>
                ({
                    op: Operation.Remove,
                    path: `/relations/${idx}`,
                }) as JsonPatchOperation);
            return await getClient().updateWorkItem(patch, id);
        }
        trackEvent("delete", {trigger, ...getProps(files)});
        const parentFiles = files.filter(({fromParent}) => fromParent);
        const parentPromise = deleteFiles(parent && parent.id, parentFiles);
        const childFiles = files.filter(({fromParent}) => !fromParent);
        const childPromise = deleteFiles(currentWi && currentWi.id, childFiles);

        const [updatedParent, updatedChild] = await Promise.all([parentPromise, childPromise]);

        parent  = updatedParent || parent;
        currentWi = updatedChild || currentWi;
        await update(currentWi as WorkItem);
    });
}

export async function renameAttachment(trigger: string, file: IFileAttachment) {
    const {name: oldName , ext} = fileNameParts(file.attributes.name);

    const newName = prompt("Enter new file name", oldName);
    if (!newName) {
        return;
    }
    const fileName = newName + (ext ?  `.${ext}` : "");
    tryExecute(async () => {
        trackEvent("rename", {trigger, ...getProps(file)});
        setStatus("Getting work item to rename attachment for...");
        const id = await getWiId(file);
        const idx = await getIdx(id, file);
        if (idx < 0) {
            return;
        }
        const patch: JsonPatchDocument & JsonPatchOperation[] = [
            {
                op: Operation.Replace,
                path: `/relations/${idx}/attributes/name`,
                value: fileName,
            } as JsonPatchOperation,
        ];
        setStatus("Renaming attachment...");
        const updated = await getClient().updateWorkItem(patch, id);
        if (file.fromParent) {
            parent = updated;
        }
        currentWi = file.fromParent ? currentWi as WorkItem : updated;
        await update(currentWi);
    });
}

export async function editComment(trigger: string, file: IFileAttachment) {
    const comment = prompt("Enter new comment", file.attributes.comment);
    if (comment === null) {
        return;
    }
    tryExecute(async () => {
        trackEvent("comment", {trigger, ...getProps(file)});
        setStatus("Getting work item to change comment attachment for...");
        const id = await getWiId(file);
        const idx = await getIdx(id, file);
        if (idx < 0) {
            return;
        }
        const patch: JsonPatchDocument & JsonPatchOperation[] = [
            {
                op: Operation.Add,
                path: `/relations/${idx}/attributes/comment`,
                value: comment,
            } as JsonPatchOperation,
        ];
        setStatus("Changing attachment comment...");
        const updated = await getClient().updateWorkItem(patch, id);
        if (file.fromParent) {
            parent = updated;
        }
        currentWi = file.fromParent ? currentWi as WorkItem : updated;
        await update(currentWi);
    });
}
