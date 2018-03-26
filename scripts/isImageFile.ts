import { IFileAttachment } from "./IFileAttachment";

const imageRegex = /\.jpe?g$|\.gif$|\.png$|\.bmp$|\.png$/i;
export function isImageFile(file: IFileAttachment) {
    return imageRegex.test(file.attributes.name);
}
