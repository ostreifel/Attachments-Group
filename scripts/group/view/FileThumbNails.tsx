import { FocusZone } from "office-ui-fabric-react/lib/components/FocusZone";
import * as React from "react";
import { IFileAttachment } from "../../IFileAttachment";
import { addFiles } from "../attachmentManager";
import { AddAttachment } from "./AddAttachment";
import { FileThumbNail } from "./FileThumbNail";

export interface IFileThumbNailsProps {
    files: IFileAttachment[];
}
export class FileThumbnails extends React.Component<IFileThumbNailsProps, {hovering?: boolean}> {
    constructor(props, context) {
        super(props, context);
        this.state = {};
    }
    public render() {
        const {files} = this.props;
        return <FocusZone
            className={`file-thumbnails ${this.state.hovering ? "dropping-files" : ""}`}
            onDragOver={(e) => {
                e.stopPropagation();
                e.preventDefault();
                this.setState({hovering: true});
            }}
            onDragLeave={(e) => {
                e.stopPropagation();
                e.preventDefault();
                this.setState({hovering: false});
            }}
            onDrop={(e) => {
                e.stopPropagation();
                e.preventDefault();
                this.setState({hovering: false});
                addFiles("drop", e.dataTransfer.files);
            }}
        >
            {files.map((_, idx) => <FileThumbNail files={files} idx={idx} />)}
            <AddAttachment />
        </FocusZone>;
    }
}
