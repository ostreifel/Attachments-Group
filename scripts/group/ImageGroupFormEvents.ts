import { IWorkItemNotificationListener } from "TFS/WorkItemTracking/ExtensionContracts";
import { refreshImages } from "./imageManager";

export class ImageGroupFormEvents implements IWorkItemNotificationListener {
    public onLoaded(/*workItemLoadedArgs: IWorkItemLoadedArgs*/): void {
        refreshImages();
    }
    public onFieldChanged(/*fieldChangedArgs: IWorkItemFieldChangedArgs*/): void {
        // refreshImages();
    }
    public onSaved(/*savedEventArgs: IWorkItemChangedArgs*/): void {
        return;
    }
    public onRefreshed(/*refreshEventArgs: IWorkItemChangedArgs*/): void {
        refreshImages();
    }
    public onReset(/*undoEventArgs: IWorkItemChangedArgs*/): void {
        // refreshImages();
    }
    public onUnloaded(/*unloadedEventArgs: IWorkItemChangedArgs*/): void {
        // throw new Error("Method not implemented.");
    }
}
