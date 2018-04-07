import * as React from "react";
import { KeyCode } from "VSS/Utils/UI";

import { trackEvent } from "../../events";
import { getFileUrl, isImageFile } from "../../fileType";
import { IFileAttachment } from "../../IFileAttachment";
import { updateIframe } from "../previewManager";
import { showGallery } from "../showGallery";

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
        const imageUrl = getFileUrl(file);
        const prevImageUrl = getFileUrl(previewFiles[idx - 1]);
        const nextImageUrl = getFileUrl(previewFiles[idx + 1]);
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
        {prevImageUrl ?
            <div className="prev nav-button"
                role="button"
                onClick={(e) => this.navigate(e, -1)}
                onKeyDown={(e) => {
                    if (e.keyCode === KeyCode.ENTER || e.keyCode === KeyCode.SPACE) {
                        this.navigate(e, -1);
                    }
                }}
                tabIndex={0}
                title="Hotkey: ◀"
            >
                <div className="image-wrapper">
                    <img className="gallery-image" src={prevImageUrl} />
                </div>
            </div> : <div />
        }
        {
            isImageFile(file) ?
            <img
                className="gallery-image center"
                src={imageUrl}
                role="button"
                tabIndex={0}
                title={file.attributes.comment}
                onClick={(e) => e.stopPropagation()}
            /> :
            <iframe className="gallery-preview center" id={this.getFileId()}/>
        }
        {nextImageUrl ?
            <div className="next nav-button"
                role="button"
                onClick={(e) => this.navigate(e, 1)}
                onKeyDown={(e) => {
                    if (e.keyCode === KeyCode.ENTER || e.keyCode === KeyCode.SPACE) {
                        this.navigate(e, 1);
                    }
                }}
                tabIndex={0}
                title="Hotkey: ▶"
            >
                <div className="image-wrapper">
                    <img className="gallery-image" src={nextImageUrl} />
                </div>
            </div> : <div />
        }
      </div>;
    }

    public componentDidUpdate() {
        const {previewFiles, idx} = this.props;
        const file = previewFiles[idx];
        updateIframe(file, this.getFileId());
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
