import { IconButton } from "office-ui-fabric-react/lib/Button";
import { Icon } from "office-ui-fabric-react/lib/Icon";
import * as React from "react";
import { HostNavigationService } from "VSS/SDK/Services/Navigation";
import { KeyCode } from "VSS/Utils/UI";

import { showDialog } from "../../dialog/showDialog";
import { trackEvent } from "../../events";
import { getFileUrl, isImageFile } from "../../fileType";
import { IFileAttachment } from "../../IFileAttachment";
import { deleteAttachment, getProps } from "../attachmentManager";
import { getFileIcon } from "./getFileIcon";

export interface IFileThumbNailProps {
    idx: number;
    files: IFileAttachment[];
}

export class FileThumbNail extends React.Component<IFileThumbNailProps, {}> {
    public render() {
        async function openFile(e: React.SyntheticEvent<HTMLElement>) {
            e.preventDefault();
            e.stopPropagation();
            if (isImage) {
                showDialog(e.type, files, idx);
            } else {
                const navigationService = await VSS.getService(VSS.ServiceIds.Navigation) as HostNavigationService;
                trackEvent("download", {trigger: e.type, fromParent: !!files[idx].fromParent + "", ...getProps()});
                navigationService.openNewWindow(fileUrl, "");
            }
        }
        async function del(e: React.SyntheticEvent<{}>) {
            e.stopPropagation();
            e.preventDefault();
            deleteAttachment(e.type, file);
        }
        const { files, idx } = this.props;
        const file = files[idx];
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
            onClick={openFile}
            onKeyDown={(e) => {
                if (e.keyCode === KeyCode.ENTER) {
                    openFile(e);
                } else if (e.keyCode === KeyCode.DELETE) {
                    del(e);
                }
            }}
        >
            <div
                className="thumb-box"
                title={title}
            >
                {
                    isImage ?
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
