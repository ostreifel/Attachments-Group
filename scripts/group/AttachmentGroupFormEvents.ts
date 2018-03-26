import { IWorkItemNotificationListener } from "TFS/WorkItemTracking/ExtensionContracts";
import { refreshAttachments } from "./attachmentManager";

export class AttachmentGroupFormEvents implements IWorkItemNotificationListener {
    public onLoaded(/*workItemLoadedArgs: IWorkItemLoadedArgs*/): void {
        refreshAttachments();
    }
    public onFieldChanged(/*fieldChangedArgs: IWorkItemFieldChangedArgs*/): void {
        // noop
    }
    public onSaved(/*savedEventArgs: IWorkItemChangedArgs*/): void {
        // noop
    }
    public onRefreshed(/*refreshEventArgs: IWorkItemChangedArgs*/): void {
        refreshAttachments();
    }
    public onReset(/*undoEventArgs: IWorkItemChangedArgs*/): void {
        // noop
    }
    public onUnloaded(/*unloadedEventArgs: IWorkItemChangedArgs*/): void {
        // noop
    }
}
