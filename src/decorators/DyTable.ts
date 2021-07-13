import { getMetadataStorage } from "../metadata/getMetadataStorage";

export function DyTable(
  name?: string
): ClassDecorator {

  return target => {
    getMetadataStorage().collectTablesMetadata({
      name: name || target.name,
      target,
    });
  };
}