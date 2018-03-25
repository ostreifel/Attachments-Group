import { IImageAttachment } from "../IImageAttachment";

export interface IContextOptions {
    images: IImageAttachment[];
    idx: number;
    close: () => void;
    setTitle: (title: string) => void;
}
