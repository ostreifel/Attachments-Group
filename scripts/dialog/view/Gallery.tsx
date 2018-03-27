import * as React from "react";
import { KeyCode } from "VSS/Utils/UI";
import { trackEvent } from "../../events";
import { IFileAttachment } from "../../IFileAttachment";
import { showGallery } from "../showGallery";

export interface IGalleryProps {
    images: IFileAttachment[];
    idx: number;
    setTitle: (title: string) => void;
    close: (trigger: string) => void;
}

function getImageUrl(image?: IFileAttachment) {
    return image && `${image.url}?filename=${image.attributes.name}`;
}

export class Gallery extends React.Component<IGalleryProps, {}> {
    public render() {
        const {images, idx, setTitle} = this.props;
        const image = images[idx];
        setTitle(image.attributes.name);
        const imageUrl = getImageUrl(image);
        const prevImageUrl = getImageUrl(images[idx - 1]);
        const nextImageUrl = getImageUrl(images[idx + 1]);
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
        <img
            className="gallery-image center"
            src={imageUrl}
            role="button"
            tabIndex={0}
            title={image.attributes.comment}
            onClick={(e) => e.stopPropagation()}
        />
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

    private navigate(e: React.SyntheticEvent<HTMLDivElement>, dir: -1 | 1) {
        e.stopPropagation();
        const idx = this.props.idx + dir;
        if (idx < 0 || idx >= this.props.images.length) {
            return;
        }
        const {images, setTitle, close} = this.props;
        trackEvent("galleryNavigate", {images: images.length + "", trigger: e.type});
        showGallery({images, setTitle, idx, close});
    }
}
