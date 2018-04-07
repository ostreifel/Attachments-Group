import { Icon } from "office-ui-fabric-react/lib/Icon";
import { initializeIcons } from "office-ui-fabric-react/lib/Icons";
import * as React from "react";
import { KeyCode } from "VSS/Utils/UI";

import { trackEvent } from "../../events";
import { getFileExtension, getFileUrl, isImageFile } from "../../fileType";
import { IFileAttachment } from "../../IFileAttachment";
import { updateIframe } from "../previewManager";
import { showGallery } from "../showGallery";

initializeIcons();

export interface IGalleryProps {
    previewFiles: IFileAttachment[];
    idx: number;
    setTitle: (title: string) => void;
    close: (trigger: string) => void;
}

export class Gallery extends React.Component<IGalleryProps, {}> {
    public render() {
        const {previewFiles, idx, setTitle} = this.props;
        const file = previewFiles[idx];
        setTitle(file.attributes.name);
        return <div
            className="gallery"
            onKeyDown={(e) => {
                if (e.shiftKey || e.altKey || e.ctrlKey) {
                    return;
                }
                if (e.keyCode === KeyCode.RIGHT) {
                    this.navigate(e, 1);
                } else if (e.keyCode === KeyCode.LEFT) {
                    this.navigate(e, -1);
                }
            }}
            onClick={(e) => this.props.close(e.type)}
        >
        {this.getNextButton("prev")}
        {this.getPreview(file)}
        {this.getNextButton("next")}
      </div>;
    }

    public componentDidUpdate() {
        this.afterRender();
    }

    public componentDidMount() {
        this.afterRender();
    }

    private getPreview(file: IFileAttachment) {
        const props = {
            role: "button",
            tabIndex: 0,
            title: file.attributes.comment,
        };
        if (isImageFile(file)) {
            return <img
                src={getFileUrl(file)}
                className="image center"
                {...props}
                onClick={(e) => e.stopPropagation()}
            />;
        }
        const ext = getFileExtension(file.attributes.name);
        if (ext === "pdf") {
            return <iframe
                className="pdf center"
                {...props}
                id={this.getFileId()}
            />;
        }
        if (ext === "mp4") {
            return <video
                className="video center"
                {...props}
                controls
                >
                <source src={getFileUrl(file)} type="video/mp4"/>
                Your browser does not support html5 video
            </video>;
        }

        return <div>{`Cannot preview ${ext} files`}</div>;
    }

    private getNextButton(dir: "prev" | "next") {
        const {previewFiles, idx} = this.props;
        const offset = dir === "prev" ? -1 : 1;
        const file: IFileAttachment | undefined = previewFiles[idx + offset];
        return (file ?
        <div className={`${dir} nav-button`}
            role="button"
            onClick={(e) => this.navigate(e, offset)}
            onKeyDown={(e) => {
                if (e.keyCode === KeyCode.ENTER || e.keyCode === KeyCode.SPACE) {
                    this.navigate(e, offset);
                }
            }}
            tabIndex={0}
            title={`Hotkey: ${dir === "next" ? "▶" : "◀"}`}
        >
            <Icon
                className="chevron-button"
                iconName={dir === "prev" ? "ChevronLeft" : "ChevronRight"}
            />
        </div> : <div />
        );
    }

    private afterRender() {
        const {previewFiles, idx} = this.props;
        const file = previewFiles[idx];
        if (!isImageFile(file)) {
            updateIframe(file, this.getFileId());
        }
    }

    private getFileId() {
        const {idx} = this.props;
        return `file${idx}`;
    }

    private navigate(e: React.SyntheticEvent<HTMLDivElement>, dir: -1 | 1) {
        e.stopPropagation();
        const idx = this.props.idx + dir;
        if (idx < 0 || idx >= this.props.previewFiles.length) {
            return;
        }
        const {previewFiles, setTitle, close} = this.props;
        trackEvent("galleryNavigate", {images: previewFiles.length + "", trigger: e.type});
        showGallery({previewFiles, setTitle, idx, close});
    }
}
