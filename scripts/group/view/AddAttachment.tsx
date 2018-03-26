import { ActionButton } from "office-ui-fabric-react/lib/Button";
import * as React from "react";
import { addFiles } from "../attachmentManager";

export class AddAttachment extends React.Component<{}, {}> {
    public render() {
        return <div className="add-image">
            <form className="file-form">
                <input
                    className="file-input"
                    accept="image/*"
                    type="file"
                    onChange={(e) => this.onChange(e)}
                    multiple={true}
                />
            </form>
            <ActionButton
                onClick={() => $(".file-input").click()}
                className="add-button"
                title="Or Click and Drag"
                iconProps={ {
                    iconName: "Add",
                } }
            >
                Add Files(s)
            </ActionButton>
        </div>;
    }
    private async onChange(
        e: React.ChangeEvent<HTMLInputElement>,
    ) {
        const { files } = e.currentTarget;
        await addFiles(files);
        ($(".file-form")[0] as HTMLFormElement).reset();
    }
}
