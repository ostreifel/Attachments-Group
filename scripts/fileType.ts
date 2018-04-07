import { IFileAttachment } from "./IFileAttachment";

export function getFileExtension(fileName: string) {
  const match = /^.*\.(.+?)$/.exec(fileName);
  const ext = match && match[1].toLowerCase();
  return ext;
}

export function getFileUrl(file: undefined): undefined;
export function getFileUrl(file: IFileAttachment): string;
export function getFileUrl(file?: IFileAttachment) {
  return file && `${file.url}?filename=${file.attributes.name}`;
}

const imageRegex = /\.jpe?g$|\.gif$|\.png$|\.bmp$|\.png$/i;
export function isImageFile(file: IFileAttachment) {
  return imageRegex.test(file.attributes.name);
}

export function isPreviewable(file: IFileAttachment) {
  if (isImageFile(file)) {
    return true;
  }
  const ext = getFileExtension(file.attributes.name);
  switch (ext) {
    // TODO can more files be previewed?
    case "pdf":
      return true;
    default:
      return false;
  }
}
