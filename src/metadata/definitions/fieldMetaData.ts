import { FiledDecoratorOption } from "../../decorators/DyField";
import { GeneralFieldMetadata } from "./types";

export interface FieldMetadata extends GeneralFieldMetadata{
    type: Function;
    // target: Function;
    // // schemaName: string;
    // name: string;
    // type: Function;
    // isSortingKey: boolean;
    // isPartitionKey: boolean;
    option?: Partial<FiledDecoratorOption>
    // getType: TypeValueThunk;
    // typeOptions: TypeOptions;
    // params?: ParamMetadata[];
}
