import { IconButton } from "office-ui-fabric-react/lib/Button";
import * as React from "react";
import { KeyCode } from "VSS/Utils/UI";
import { showDialog } from "../../dialog/showDialog";
import { IFileAttachment } from "../../IFileAttachment";
import { deleteAttachment } from "../attachmentManager";

export interface IFileThumbNailProps {
    idx: number;
    files: IFileAttachment[];
}

const imageRegex = /\.jpe?g$|\.gif$|\.png$|\.bmp$|\.png$/i;
export class FileThumbNail extends React.Component<IFileThumbNailProps, {}> {
    public render() {
        const { files, idx } = this.props;
        const file = files[idx];
        const imageUrl = `${file.url}?filename=${file.attributes.name}`;
        const isImage: boolean = imageRegex.test(file.attributes.name);
        return <a
            className="thumbnail-tile"
            href={imageUrl}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isImage) {
                    showDialog(files, idx);
                }
            }}
            onKeyDown={(e) => {
                if (e.keyCode === KeyCode.ENTER) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isImage) {
                        showDialog(files, idx);
                    }
                }
            }}
        >
            <div className="thumb-box">
                <img className="thumbnail" src={imageUrl} />
            </div>
            <div className="title">
                <div className="text">{file.attributes.name}</div>
                <IconButton
                    className="delete-button"
                    iconProps={{iconName: "Delete"}}
                    title="Delete"
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        deleteAttachment(file);
                    }}
                />
            </div>
        </a>;
    }
}
