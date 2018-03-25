import { KeyCode } from "VSS/Utils/UI";
import { IContextOptions } from "./IContextOptions";
import { showGallery } from "./showGallery";

const {
    images,
    idx,
    close,
    setTitle,
} = VSS.getConfiguration() as IContextOptions;

$(window).bind("keydown", (event) => {
    if (event.keyCode === KeyCode.ESCAPE) {
        close();
    }
});

showGallery({images, idx, setTitle, close}).then(() => {
    $(".gallery-image.center").focus();
});

VSS.register("imageGallery", {});
