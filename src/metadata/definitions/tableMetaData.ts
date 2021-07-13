import { FieldMetadata } from "./fieldMetaData";

export interface TableClassMetadata {
    name: string;
    target: Function;
    fields?: FieldMetadata[];
    isAbstract?: boolean;
}