import { BrowserCheckUtils } from "VSS/Utils/UI";

import { getMimeTypes } from "./getMimeType";
import { IFileAttachment } from "./IFileAttachment";

export function fileNameParts(fileName: string) {
  const match = /^(.*)\.(.+?)$/.exec(fileName);
  return {
    name: match ? match[1] : fileName,
    ext: match && match[2],
  };
}

export interface IFileClassification {
  video: boolean;
  image: boolean;
  text: boolean;
  application: boolean;
  audio: boolean;
}
export function getClassification(ext: string): IFileClassification {
  const classifications: IFileClassification = {
    application: false,
    audio: false,
    image: false,
    text: false,
    video: false,
  };
  const mimeTypes = getMimeTypes(ext);
  if (mimeTypes.length === 0) {
      return classifications;
  }
  const classificationTexts = mimeTypes.map((t) => (/(.+)\//.exec(t) || [])[1]);
  for (const c of classificationTexts) {
      if (c) {
          classifications[c] = true;
      }
  }
  return classifications;
}

export function getFileExtension(fileName: string) {
  return fileNameParts(fileName).ext;
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

export function isTextFile(file: IFileAttachment) {
  const ext = getFileExtension(file.attributes.name);
  if (!ext) {
    return false;
  }
  return getClassification(ext).text;
}

export function isPreviewable(file: IFileAttachment): boolean {
  if (isImageFile(file)) {
    return true;
  }
  const ext = getFileExtension(file.attributes.name);
  switch (ext) {
    // TODO can more files be previewed?
    case "pdf":
      return !BrowserCheckUtils.isEdge() && !BrowserCheckUtils.isIE();
    case "mp4":
      return !BrowserCheckUtils.isEdge() && !BrowserCheckUtils.isIE();
    default:
      return isTextFile(file) && !BrowserCheckUtils.isIE();
  }
}
