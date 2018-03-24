import { IProperties, trackEvent } from "./events";
import { setError, setStatus, showImages } from "./view/showImages";

async function tryExecute(callback: () => Promise<void>) {
    try {
        await callback();
        setStatus("");
    } catch (error) {
        const message = (
            typeof error === "string" ? error : (error.serverError || error || {}).message
        ) ||
        error + "" ||
        "unknown error";

        // tslint:disable-next-line:no-console
        console.error(error);
        trackEvent("error", {message, ...getProps()});
        setError(message);
    }
}

function getProps(): IProperties {
    return {
        // wiCount: Object.keys(wis).length + "",
        // relCount: rels.length + "",
    };
}

export async function refreshImages(): Promise<void> {
    tryExecute(async () => {
        trackEvent("refresh", {new: "false", ...getProps()});
        // const formService = await WorkItemFormService.getService();
        // wi = await getClient().getWorkItem(await formService.getId(), undefined, undefined, WorkItemExpand.Links);
        // wi.relations.
        showImages();
    });
}
