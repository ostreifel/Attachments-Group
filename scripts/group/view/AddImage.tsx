import { ActionButton } from "office-ui-fabric-react/lib/Button";
import * as React from "react";
import { addFiles } from "../imageManager";

export class AddImage extends React.Component<{}, {}> {
    public render() {
        return <div className="add-image">
            <input className="file-input" accept="image/*" type="file" onChange={(e) => this.onChange(e)}/>
            <ActionButton
                onClick={() => $(".file-input").click()}
                className="add-button"
                title="Or Click and Drag"
                iconProps={ {
                    iconName: "Add",
                } }
            >
                Add Image(s)
            </ActionButton>
        </div>;
    }
    private onChange(
        e: React.ChangeEvent<HTMLInputElement>,
    ): void {
        const { files } = e.currentTarget;
        addFiles(files);
    }
}
