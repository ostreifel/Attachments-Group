import { getFileUrl } from "../fileType";
import { IFileAttachment } from "../IFileAttachment";

async function getFile(url: string): Promise<Blob> {
    throw new Error(url);
}

export async function updateIframe(file: IFileAttachment, id: string) {
    const fileBlob = await getFile(getFileUrl(file));
    const fileUrl = window.URL.createObjectURL(fileBlob);
    // tslint:disable-next-line:no-console
    console.log(fileUrl);
    const ele = document.getElementById(id);
    if (!ele)  {
        return null;
    }
}
