import { getMetadataStorage } from "../metadata";
import { getTypeDecoratorParams } from "./helper";
import { DecoratorOptions, KeysOptions } from "./types";

export type FiledDecoratorOption =  DecoratorOptions & KeysOptions
  
export function DyField(
    returnTypeFuncOrOptions?: FiledDecoratorOption| Function,
    maybeOptions?: FiledDecoratorOption,
  ): PropertyDecorator { // missing method Decorator
    return (prototype, propertyKey) => {  
      const reflectMetadataType = Reflect && (Reflect as any)
          .getMetadata ? (Reflect as any)
          .getMetadata("design:type", prototype, propertyKey) : undefined;
      const { options, returnTypeFunc } = getTypeDecoratorParams(
        returnTypeFuncOrOptions,
        maybeOptions,
      );
     
      getMetadataStorage().collectClassFieldMetadata({
        name: propertyKey as string,// symbol error
        // schemaName: options.name ?? propertyKey as string,
        type: returnTypeFunc??reflectMetadataType,
        target: prototype.constructor,
        isSortingKey: options.isSortingKey ?? false,
        isPartitionKey: options.isPartitionKey ?? false,
        option: options
      });
    };
}
  