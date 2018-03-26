import { IconButton } from "office-ui-fabric-react/lib/Button";
import { Icon } from "office-ui-fabric-react/lib/Icon";
import * as React from "react";
import { HostNavigationService } from "VSS/SDK/Services/Navigation";
import { KeyCode } from "VSS/Utils/UI";
import { showDialog } from "../../dialog/showDialog";
import { IFileAttachment } from "../../IFileAttachment";
import { isImageFile } from "../../isImageFile";
import { deleteAttachment } from "../attachmentManager";

export interface IFileThumbNailProps {
    idx: number;
    files: IFileAttachment[];
}

export class FileThumbNail extends React.Component<IFileThumbNailProps, {}> {
    public render() {
        const { files, idx } = this.props;
        const file = files[idx];
        const isImage: boolean = isImageFile(file);
        const fileUrl = `${file.url}?filename=${file.attributes.name}`;
        async function openFile(e: React.SyntheticEvent<HTMLElement>) {
            e.preventDefault();
            e.stopPropagation();
            if (isImage) {
                showDialog(files, idx);
            } else {
                const navigationService = await VSS.getService(VSS.ServiceIds.Navigation) as HostNavigationService;
                navigationService.openNewWindow(fileUrl, "");
            }
        }
        async function del(e: React.SyntheticEvent<{}>) {
            e.stopPropagation();
            e.preventDefault();
            deleteAttachment(file);
        }
        return <a
            className="thumbnail-tile"
            href={fileUrl}
            onClick={openFile}
            onKeyDown={(e) => {
                if (e.keyCode === KeyCode.ENTER) {
                    openFile(e);
                } else if (e.keyCode === KeyCode.DELETE) {
                    del(e);
                }
            }}
        >
            <div className="thumb-box">
                {isImage ? <img className="thumbnail image" src={fileUrl} title={file.attributes.comment} /> :
                <Icon className="thumbnail file" iconName="TextDocument" title={file.attributes.comment} />}
            </div>
            <div className="title">
                <div className="text">{file.attributes.name}</div>
                <IconButton
                    className="delete-button"
                    iconProps={{iconName: "Delete"}}
                    title="Delete (del)"
                    onClick={del}
                />
            </div>
        </a>;
    }
}
