import { GeneralFieldMetadata } from "./types";

export interface SecondaryIndexKeyMetaData extends GeneralFieldMetadata {
    indexName: string;
    isGlobalIndex: boolean,
    isLocalIndex: boolean, 
}
