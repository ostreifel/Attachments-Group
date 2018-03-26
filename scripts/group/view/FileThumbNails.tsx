import { FocusZone } from "office-ui-fabric-react/lib/components/FocusZone";
import * as React from "react";
import { IFileAttachment } from "../../IFileAttachment";
import { AddAttachment } from "./AddAttachment";
import { FileThumbNail } from "./FileThumbNail";

export interface IFileThumbNailsProps {
    files: IFileAttachment[];
}
export class FileThumbnails extends React.Component<IFileThumbNailsProps, {}> {
    public render() {
        const {files} = this.props;
        return <FocusZone className="file-thumbnails">
            {files.map((_, idx) => <FileThumbNail files={files} idx={idx} />)}
            <AddAttachment />
        </FocusZone>;
    }
}
