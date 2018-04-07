import { trackEvent } from "../events";
import { isPreviewable } from "../fileType";
import { getProps } from "../group/attachmentManager";
import { IFileAttachment } from "../IFileAttachment";
import { IContextOptions } from "./IContextOptions";

export async function showDialog(trigger: string, files: IFileAttachment[], idx: number) {
    const previewFiles: IFileAttachment[] = [];
    let offset = 0;
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (isPreviewable(file)) {
            previewFiles.push(file);
        } else if (i < idx) {
            offset++;
        }
    }
    idx -= offset;
    trackEvent("openDialog", {trigger, fromParent: !!files[idx].fromParent + "", ...getProps()});
    const dialogService = (await VSS.getService(VSS.ServiceIds.Dialog)) as IHostDialogService;
    let closeDialog: () => void;
    let setTitle: (title: string) => undefined;
    const context: IContextOptions = {
        previewFiles,
        idx,
        setTitle: (title: string) => {
            setTitle(title);
        },
        close: (closeTrigger: string) => {
            trackEvent("closeDialog", {trigger: closeTrigger, ...getProps()});
            closeDialog();
        },
    };
    const dialogOptions: IHostDialogOptions = {
        title: previewFiles[idx].attributes.name,
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
