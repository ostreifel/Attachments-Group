/// <reference types="vss-web-extension-sdk" />
import "promise-polyfill/src/polyfill";
import { WorkItemFormService } from "TFS/WorkItemTracking/Services";
import { AttachmentGroupFormEvents } from "./AttachmentGroupFormEvents";

// save on ctr + s
$(window).bind("keydown", (event) => {
    if (event.ctrlKey || event.metaKey) {
        if (String.fromCharCode(event.which).toLowerCase() === "s") {
            event.preventDefault();
            WorkItemFormService.getService().then((service) => service.beginSaveWorkItem($.noop, $.noop));
        }
    }
});

VSS.register(VSS.getContribution().id, new AttachmentGroupFormEvents());
