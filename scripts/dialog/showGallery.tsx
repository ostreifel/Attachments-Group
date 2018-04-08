import * as React from "react";
import * as ReactDOM from "react-dom";

import { trackEvent } from "../events";
import { getFileExtension } from "../fileType";
import { Gallery, IGalleryProps } from "./view/Gallery";

export function showGallery(props: IGalleryProps) {
  const { previewFiles, idx } = props;
  const ext = getFileExtension(previewFiles[idx].attributes.name) || "";
  trackEvent("showGallery", { ext });
  return new Promise((resolve) => {
    const container = document.getElementById("gallery-wrapper");
    ReactDOM.render(<Gallery {...props} />, container, () => {
      resolve();
    });
  });
}
