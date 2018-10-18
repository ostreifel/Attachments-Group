import { IconButton } from "office-ui-fabric-react/lib/Button";
import { IContextualMenuItem } from "office-ui-fabric-react/lib/ContextualMenu";
import { Icon } from "office-ui-fabric-react/lib/Icon";
import * as React from "react";
import { KeyCode } from "VSS/Utils/UI";

import { showGalleryDialog } from "../../dialog/showGalleryDialog";
import { trackEvent } from "../../events";
import { getFileUrl, isImageFile, isPreviewable } from "../../fileType";
import { deleteAttachments, editComment, getProps, renameAttachment, tryExecute } from "../attachmentManager";
import { getFileIcon } from "./getFileIcon";
import { IFileThumbnail } from "./IFileThumbnail";
import { setStatus, showAttachments } from "./showAttachments";

export interface IFileThumbNailProps {
    idx: number;
    files: IFileThumbnail[];
}

let isShift: boolean = false;
let isCtr: boolean = false;

export class FileThumbNail extends React.Component<IFileThumbNailProps, {}> {
    public render() {
        const file = this.file();
        const isImage: boolean = isImageFile(file);
        const icon = isImage ? null : getFileIcon(file.attributes.name);
        const fileUrl = getFileUrl(file);
        const title = `${
            file.fromParent ? "From parent: " : ""
        }${
            file.attributes.comment || file.attributes.name
        }`;
        return <a
            className={`thumbnail-tile ${file.selected ? "selected" : ""}`}
            href={fileUrl}
            onFocus={this.onFocus.bind(this)}
            onClick={this.onClick.bind(this)}
            onDoubleClick={this.openFile.bind(this)}
            onMouseDown={(e) => {
                isShift = e.shiftKey;
                isCtr = e.ctrlKey;
            }}
            onKeyDown={async (e) => {
                e.persist();
                if (e.keyCode === KeyCode.ENTER) {
                    await this.openFile(e);
                } else if (e.keyCode === KeyCode.DELETE) {
                    await this.del(e);
                } else if (e.keyCode === KeyCode.F2) {
                    await this.rename(e);
                } else if (e.keyCode === KeyCode.D && e.shiftKey) {
                    await this.openFile(e, "force download");
                } else if (e.keyCode === KeyCode.C && e.shiftKey) {
                    await this.comment(e);
                } else if (e.keyCode === KeyCode.F10 && e.shiftKey) {
                    e.preventDefault();
                    e.stopPropagation();
                    $(e.target).find(".options").click();
                } else if (e.keyCode === KeyCode.A && e.ctrlKey) {
                    e.stopPropagation();
                    e.preventDefault();
                    this.props.files.forEach((f) => f.selected = true);
                    showAttachments(this.props.files, false);
                }
                isShift = e.shiftKey;
                isCtr = e.ctrlKey;
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
            <div className="title" onClick={(e) => {
                e.type = "title";
                this.openFile(e);
            }}>
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

    private onClick(e: React.MouseEvent<HTMLAnchorElement>) {
        // Don't navigate link
        e.preventDefault();
    }

    private onFocus(
        e: React.FocusEvent<HTMLAnchorElement>,
    ) {
        const thisFile = this.file();
        const {files} = this.props;
        if (e.target instanceof HTMLButtonElement && $(e.target).hasClass("options")) {
            if (!thisFile.selected) {
                files.forEach((f) => f.selected = false);
                thisFile.selected = true;
                showAttachments(this.props.files, false);
            }
            return;
        }
        if (isShift) {
            thisFile.selected = true;
            const thisIdx = this.props.idx;
            let foundSelected = false;
            let idx = -1;
            for (idx = thisIdx - 1; idx >= 0; idx--) {
                foundSelected = !!files[idx].selected;
                if (foundSelected) {
                    break;
                }
            }
            if (!foundSelected) {
                for (idx = thisIdx + 1; idx < files.length; idx++) {
                    foundSelected = !!files[idx].selected;
                    if (foundSelected) {
                        break;
                    }
                }
            }
            if (foundSelected) {
                const start = Math.min(idx, thisIdx);
                const end = Math.max(idx, thisIdx);
                for (let i = start + 1; i < end; i++) {
                    files[i].selected = true;
                }
            }
        } else if (isCtr) {
            thisFile.selected = true;
        } else {
            files.forEach((f) => f.selected = false);
            thisFile.selected  = true;
        }
        showAttachments(this.props.files, false);
    }

    private file() {
        const { files, idx } = this.props;
        return files[idx];
    }

    private selected(): IFileThumbnail[] {
        return this.props.files.filter((f) => f.selected);
    }

    private getMenuOptions(): IContextualMenuItem[] {
        const options: IContextualMenuItem[] = [
            {
                key: "Delete",
                icon: "Delete",
                name: "Delete (del)",
                onClick: this.del.bind(this),
            },
            {
                key: "Download",
                icon: "Download",
                name: "Download (shift + d)",
                onClick: (e) => {
                    if (!e) { return; }
                    this.openFile(e, "force download");
                },
            },
        ];
        if (this.selected().length <= 1) {
            options.push(
                {
                    key: "Rename",
                    icon: "Rename",
                    name: "Rename (f2)",
                    onClick: this.rename.bind(this),
                },
                {
                    key: "Comment",
                    icon: "Comment",
                    name: "Edit Comment (shift + c)",
                    onClick: this.comment.bind(this),
                },
            );
        }
        return options;
    }

    private findLink(e: React.SyntheticEvent<HTMLElement>): HTMLAnchorElement {
        const target = e.currentTarget;
        if (target instanceof HTMLAnchorElement) {
            return target;
        }
        return $(target).closest("a")[0] as HTMLAnchorElement;
    }

    private async openFile(e: React.SyntheticEvent<HTMLElement>, forceDownload?: "force download") {
        e.preventDefault();
        e.stopPropagation();
        tryExecute(async () => {
            const selected = this.selected();
            if (isPreviewable(this.file()) && !forceDownload) {
                setStatus("showing preview gallery...");
                const files = selected.length > 1 ? selected : this.props.files;
                const idx = selected.length > 1 ? files.map(({url}) => url).indexOf(this.file().url) : this.props.idx;
                const link = this.findLink(e);
                await showGalleryDialog(e.type, files, idx);
                link.focus();
            } else {
                setStatus("downloading files...");
                trackEvent("download", {trigger: e.type, forceDownload: !!forceDownload + "", ...getProps(selected)});
                for (const file of selected) {
                    window.open(getFileUrl(file, !!forceDownload), "_blank");
                }
            }
        });
    }

    private async del(e?: React.SyntheticEvent<HTMLElement>) {
        if (!e) { return; }
        const link = this.findLink(e);
        await deleteAttachments(e.type, this.selected());
        if (link) {
            link.focus();
        }
    }

    private async rename(e?: React.SyntheticEvent<HTMLElement>) {
        if (!e) { return; }
        await renameAttachment(e.type, this.file());
    }

    private async comment(e?: React.SyntheticEvent<HTMLElement>) {
        if (!e) { return; }
        await editComment(e.type, this.file());
    }
}
