import { WorkItemRelation } from "TFS/WorkItemTracking/Contracts";

export interface IImageAttachment extends WorkItemRelation {
    rel: "AttachedFile";
    url: string;
    attributes: {
        authorizedDate: string;
        id: number;
        resourceCreatedDate: string;
        resourceModifiedDate: string;
        revizedDate: string;
        resourceSize: number;
        name: string;
        comment?: string;
    };
}
