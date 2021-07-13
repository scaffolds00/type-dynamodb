import { MetadataStorage } from "../metaDataStorage";


export interface GeneralFieldMetadata {
    target: Function;
    name: string;
    isSortingKey: boolean;
    isPartitionKey: boolean;
}

export type globalEnvType = 
    NodeJS.Global &
    typeof globalThis &
    {TypeGraphQLMetadataStorage: MetadataStorage}

