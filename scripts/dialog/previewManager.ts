import { getFileUrl } from "../fileType";
import { IFileAttachment } from "../IFileAttachment";

async function getFile(url: string) {

}

async function updateIframe(fileRef: IFileAttachment, id: string) {
    const file = await getFile(getFileUrl(fileRef));
}
