import { IFileAttachment } from "../IFileAttachment";

export interface IContextOptions {
    previewFiles: IFileAttachment[];
    idx: number;
    close: (trigger: string) => void;
    setTitle: (title: string) => void;
}
