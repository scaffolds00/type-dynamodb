import { getMetadataStorage } from "../metadata";

  
export function DyLocalSecondaryIndex(
    indexName: string,
  ): PropertyDecorator { // missing method Decorator
    return (prototype, propertyKey) => {     
      getMetadataStorage().collectSecondaryKeysMetadata({
        indexName: indexName,
        name: propertyKey as string,// symbol error
        target: prototype.constructor,
        isGlobalIndex: false,
        isLocalIndex: true, 
        isSortingKey: true,
        isPartitionKey: false,
      });
    };
}
  