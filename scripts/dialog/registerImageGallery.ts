import { KeyCode } from "VSS/Utils/UI";
import { IContextOptions } from "./IContextOptions";
import { showGallery } from "./showGallery";

const {
    previewFiles,
    idx,
    close,
    setTitle,
} = VSS.getConfiguration() as IContextOptions;

$(window).bind("keydown", (event) => {
    if (event.keyCode === KeyCode.ESCAPE) {
        close(event.type);
    }
});

showGallery({previewFiles, idx, setTitle, close}).then(() => {
    $(".gallery-image.center").focus();
});

VSS.register("imageGallery", {});
