import { IFileAttachment } from "../IFileAttachment";

export interface IContextOptions {
    images: IFileAttachment[];
    idx: number;
    close: () => void;
    setTitle: (title: string) => void;
}
