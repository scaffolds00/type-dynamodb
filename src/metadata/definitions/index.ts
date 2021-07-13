import { MetadataStorage } from "../metaDataStorage";

export type globalEnvType = 
    NodeJS.Global &
    typeof globalThis &
    {TypeGraphQLMetadataStorage: MetadataStorage}