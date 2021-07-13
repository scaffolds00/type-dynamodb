import { MetadataStorage } from "../metadata/metaDataStorage";
import { globalEnvType } from "./definitions";

export function getMetadataStorage(): MetadataStorage {
  return (
    (<globalEnvType>global).TypeGraphQLMetadataStorage || ((<globalEnvType>global).TypeGraphQLMetadataStorage = new MetadataStorage())
  );
}