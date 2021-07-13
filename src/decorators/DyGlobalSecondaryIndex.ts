import { getMetadataStorage } from "../metadata";
import { KeysOptions } from "./types";

  
export function DyGlobalSecondaryIndex(
    indexName: string,
    {isPartitionKey, isSortingKey}: KeysOptions,
  ): PropertyDecorator { // missing method Decorator
    return (prototype, propertyKey) => {
        if( (!isPartitionKey && !isPartitionKey) ||
            (isPartitionKey && isPartitionKey) ){
            throw Error("secondaryIndex field must be sortingKey or PartitionKey")
        }     
      getMetadataStorage().collectSecondaryKeysMetadata({
        indexName: indexName,
        name: propertyKey as string,// symbol error
        target: prototype.constructor,
        isSortingKey: isSortingKey ?? false,
        isPartitionKey: isPartitionKey ?? false,
        isGlobalIndex: true,
        isLocalIndex: false, 
      });
    };
}
  