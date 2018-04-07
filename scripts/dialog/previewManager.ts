import { getClient } from "TFS/WorkItemTracking/RestClient";

import { getFileExtension } from "../fileType";
import { getMimeTypes } from "../getMimeType";
import { IFileAttachment } from "../IFileAttachment";

function getFileId(file: IFileAttachment): string {
    return (file.url.match(/attachments\/(.*)/) as RegExpMatchArray)[1];
}

async function getFile(file: IFileAttachment): Promise<Blob> {
    const fileId = getFileId(file);
    const [type] = getMimeTypes(getFileExtension(file.attributes.name) as string);
    const buffer = await getClient().getAttachmentContent(fileId, file.attributes.name);
    const dataview = new DataView(buffer);
    return new Blob([dataview], {type});
}

const urls: {[id: string]: Promise<Blob>} = {};
export async function updateIframe(file: IFileAttachment, id: string) {
    if (!urls.hasOwnProperty(file.url)) {
        urls[file.url] = getFile(file);
    }
    const blob = await urls[file.url];
    const fileUrl = window.URL.createObjectURL(blob);
    const ele = document.getElementById(id) as HTMLIFrameElement;
    console.log("showing url", fileUrl, blob);
    if (ele) {
        ele.src = fileUrl;
    }
}
