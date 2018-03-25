import { trackEvent } from "../events";
import { IImageAttachment } from "../IImageAttachment";
import { IContextOptions } from "./IContextOptions";

export async function showDialog(images: IImageAttachment[], idx: number) {
    const dialogService = (await VSS.getService(VSS.ServiceIds.Dialog)) as IHostDialogService;
    let closeDialog = () => {
        // tslint:disable-next-line:no-console
        console.log("could not find close dialog function");
    };
    function close() {
        trackEvent("keyboardExit");
        closeDialog();
    }
    const context: IContextOptions = {
        images,
        idx,
        close,
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
    closeDialog = () => dialog.close();
    /* const callbacks: ICallbacks =  */
    await dialog.getContributionInstance("imageGallery");
}
