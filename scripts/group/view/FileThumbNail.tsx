import { IconButton } from "office-ui-fabric-react/lib/Button";
import { IContextualMenuItem } from "office-ui-fabric-react/lib/ContextualMenu";
import { Icon } from "office-ui-fabric-react/lib/Icon";
import * as React from "react";
import { HostNavigationService } from "VSS/SDK/Services/Navigation";
import { KeyCode } from "VSS/Utils/UI";

import { showDialog } from "../../dialog/showDialog";
import { trackEvent } from "../../events";
import { getFileUrl, isImageFile, isPreviewable } from "../../fileType";
import { IFileAttachment } from "../../IFileAttachment";
import { deleteAttachment, editComment, getProps, renameAttachment } from "../attachmentManager";
import { getFileIcon } from "./getFileIcon";

export interface IFileThumbNailProps {
    idx: number;
    files: IFileAttachment[];
}

export class FileThumbNail extends React.Component<IFileThumbNailProps, {}> {
    public render() {
        const file = this.file();
        const isImage: boolean = isImageFile(file);
        const icon = isImage ? null : getFileIcon(file.attributes.name);
        const fileUrl = getFileUrl(file);
        const title = `${
            file.fromParent ? "From parent" : ""
        }${
            file.fromParent && file.attributes.comment ? ": " : ""
        }${
            file.attributes.comment || ""
        }`;
        return <a
            className="thumbnail-tile"
            href={fileUrl}
            onClick={this.openFile.bind(this)}
            onKeyDown={(e) => {
                if (e.keyCode === KeyCode.ENTER) {
                    this.openFile(e);
                } else if (e.keyCode === KeyCode.DELETE) {
                    this.del(e);
                } else if (e.keyCode === KeyCode.F2) {
                    renameAttachment(e.type, file);
                }
            }}
        >
            <div
                className="thumb-box"
                title={title}
            >
                {
                    isImage || !icon ?
                    <img className="thumbnail image preview" src={fileUrl}/> :
                    icon.type === "url" ?
                    <img className="thumbnail image" src={icon.url}/> :
                    <Icon
                        className="thumbnail file"
                        iconName={icon.name}
                    />
                }
                {
                    file.fromParent ?
                    <Icon
                        className="overlay"
                        iconName={"Up"}
                    /> : null
                }
            </div>
            <div className="title">
                <div className="text" title={file.attributes.name}>{file.attributes.name}</div>
            </div>
            <IconButton
                iconProps={ {
                    iconName: "More",
                    title: "More Options",
                } }
                tabIndex={-1}
                data-is-focusable={false}
                split={false}
                className="options"
                menuProps={{
                    items: this.getMenuOptions(),
                    isBeakVisible: false,
                }}
            />
        </a>;
    }

    private async openFile(e: React.SyntheticEvent<HTMLElement>, forceDownload?: "force download") {
        e.preventDefault();
        e.stopPropagation();
        const { files, idx } = this.props;
        const file = this.file();
        if (isPreviewable(file) && !forceDownload) {
            showDialog(e.type, files, idx);
        } else {
            const navigationService = await VSS.getService(VSS.ServiceIds.Navigation) as HostNavigationService;
            trackEvent("download", {trigger: e.type, forceDownload: !!forceDownload + "", ...getProps(files[idx])});
            navigationService.openNewWindow(getFileUrl(file, !!forceDownload), "");
        }
    }

    private getMenuOptions(): IContextualMenuItem[] {
        return [
            {
                key: "Delete",
                icon: "Delete",
                name: "Delete (del)",
                onClick: (e) => {
                    if (!e) { return; }
                    this.del(e);
                },
            },
            {
                key: "Rename",
                icon: "Rename",
                name: "Rename (f2)",
                onClick: (e) => {
                    if (!e) { return; }
                    renameAttachment(e.type, this.file());
                },
            },
            {
                key: "Comment",
                icon: "Comment",
                name: "Edit Comment",
                onClick: (e) => {
                    if (!e) { return; }
                    editComment(e.type, this.file());
                },
            },
            {
                key: "Download",
                icon: "Download",
                name: "Download",
                onClick: (e) => {
                    if (!e) { return; }
                    this.openFile(e, "force download");
                },
            },
        ];
    }

    private file() {
        const { files, idx } = this.props;
        return files[idx];
    }
    private async del(e: React.SyntheticEvent<{}>) {
        deleteAttachment(e.type, this.file());
    }
}
