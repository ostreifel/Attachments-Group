import { trackEvent } from "../events";
import { IFileAttachment } from "../IFileAttachment";
import { isImageFile } from "../isImageFile";
import { IContextOptions } from "./IContextOptions";

export async function showDialog(files: IFileAttachment[], idx: number) {
    const images: IFileAttachment[] = [];
    let offset = 0;
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (isImageFile(file)) {
            images.push(file);
        } else if (i < idx) {
            offset++;
        }
    }
    idx -= offset;
    const dialogService = (await VSS.getService(VSS.ServiceIds.Dialog)) as IHostDialogService;
    let closeDialog: () => void;
    let setTitle: (title: string) => undefined;
    const context: IContextOptions = {
        images,
        idx,
        setTitle: (title: string) => {
            setTitle(title);
        },
        close: () => {
            trackEvent("keyboardExit");
            closeDialog();
        },
    };
    const dialogOptions: IHostDialogOptions = {
        title: images[idx].attributes.name,
        width: Number.MAX_VALUE,
        height: Number.MAX_VALUE,
        resizable: true,
        buttons: [],
    };
    const extInfo = VSS.getExtensionContext();

    const contentContribution = `${extInfo.publisherId}.${extInfo.extensionId}.imageGallery`;
    const dialog = await dialogService.openDialog(contentContribution, dialogOptions, context);
    setTitle = (title: string) => dialog.setTitle(title);
    closeDialog = () => dialog.close();
    /* const callbacks: ICallbacks =  */
    await dialog.getContributionInstance("imageGallery");
}
