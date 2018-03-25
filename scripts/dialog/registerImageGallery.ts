import { KeyCode } from "VSS/Utils/UI";
import { IContextOptions } from "./IContextOptions";
import { showGallery } from "./showGallery";

const {
    images,
    idx,
    close,
} = VSS.getConfiguration() as IContextOptions;

$(window).bind("keydown", (event) => {
    if (event.keyCode === KeyCode.ESCAPE) {
        close();
    }
});

showGallery(images, idx);

VSS.register("imageGallery", {});
