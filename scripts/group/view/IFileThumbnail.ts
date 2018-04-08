import { IFileAttachment } from "../../IFileAttachment";

/** IFileAttachment but with extra properties for rendering thumbnails */
export interface IFileThumbnail extends IFileAttachment {
    selected?: boolean;
}
