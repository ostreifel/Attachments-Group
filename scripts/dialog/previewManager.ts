import { getClient } from "TFS/WorkItemTracking/RestClient";

import { trackEvent } from "../events";
import { getFileExtension } from "../fileType";
import { getMimeTypes } from "../getMimeType";
import { IFileAttachment } from "../IFileAttachment";

function getFileId(file: IFileAttachment): string {
    return (file.url.match(/attachments\/(.*)/) as RegExpMatchArray)[1];
}

async function getFileBlobFromRest(file: IFileAttachment): Promise<Blob> {
    const fileId = getFileId(file);
    const [type] = getMimeTypes(getFileExtension(file.attributes.name) as string);
    trackEvent("filePreview", {type});
    const buffer = await getClient().getAttachmentContent(fileId, file.attributes.name);
    const dataview = new DataView(buffer);
    return new Blob([dataview], {type});
}

const urls: {[id: string]: Promise<Blob>} = {};
function getFileBlob(file: IFileAttachment) {
    if (!urls.hasOwnProperty(file.url)) {
        urls[file.url] = getFileBlobFromRest(file);
    }
    return urls[file.url];
}
export async function showPdfFile(file: IFileAttachment, id: string) {
    const blob = await getFileBlob(file);
    const fileUrl = window.URL.createObjectURL(blob);
    const ele = document.getElementById(id) as HTMLIFrameElement;
    if (ele) {
        ele.src = fileUrl;
    }
}
export async function showTextFile(file: IFileAttachment, id: string) {
    const blob = await getFileBlob(file);
    const text = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.addEventListener("loadend", () => {
            resolve(reader.result as string);
        });
        reader.readAsText(blob);
    });
    const ele = $(`#${id}`);
    ele.parent().removeClass("loading");
    ele.text(text);
}
