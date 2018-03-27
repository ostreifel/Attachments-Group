import { IFileAttachment } from "../IFileAttachment";

export interface IContextOptions {
    images: IFileAttachment[];
    idx: number;
    close: (trigger: string) => void;
    setTitle: (title: string) => void;
}
