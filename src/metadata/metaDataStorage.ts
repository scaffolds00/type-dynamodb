import { FieldMetadata } from "./definitions/fieldMetaData";
import { SecondaryIndexKeyMetaData } from "./definitions/secondaryKeysMetaData";
import { TableClassMetadata } from "./definitions/tableMetaData";
import { GeneralFieldMetadata } from "./definitions/types";

export class MetadataStorage {
    tables: TableClassMetadata[] = [];
    fields: FieldMetadata[] = []
    secondaryKeys: SecondaryIndexKeyMetaData[] = []

    collectClassFieldMetadata(field: FieldMetadata) {
        this.fields.push(field);
    }

    collectSecondaryKeysMetadata(key: SecondaryIndexKeyMetaData) {
        this.secondaryKeys.push(key);
    }

    collectTablesMetadata(definition: TableClassMetadata) {
        this.tables.push(definition);
    }

    getPartitionKey(target:Function, indexName?: string): GeneralFieldMetadata{
        if(indexName){
            const partitionKey = this.secondaryKeys.find((key)=>
            (key.isPartitionKey == true && key.target == target) && indexName == key.indexName);
            if(partitionKey) return partitionKey;
            else{
                const partitionKey = this.fields.find((key)=>
                (key.isPartitionKey == true && key.target == target));
                if(!partitionKey){
                    throw Error(`Can not find partitionKey for index ${indexName}`);
                }
                return partitionKey
            }
        }
        else{
            const partitionKey = this.fields.find((key)=> (key.isPartitionKey == true && key.target == target));
            if(!partitionKey){
                throw Error(`Can not find partitionKey for index ${indexName}`);
            }
            return partitionKey
        }
        
    }

    getSortingKey(target:Function, indexName?: string): GeneralFieldMetadata| undefined{
        if(indexName){
            return this.secondaryKeys.find((key)=>
            (key.isSortingKey == true && key.target == target) && indexName == key.indexName);
        }
        else{
            return this.fields.find((key)=> (key.isSortingKey == true && key.target == target));
        }
    }

    getConstructorKeysMetaData(target: Function, options: {indexName?: string} = {indexName: undefined}): {
        partitionKey: GeneralFieldMetadata;
        sortingKey: GeneralFieldMetadata | undefined;
    }{
        const {indexName } = options;
        return{
            partitionKey: this.getPartitionKey(target, indexName),
            sortingKey: this.getSortingKey(target, indexName),
        }
    }

    // getKeys
    getConstructorFieldsMetaData(target: Function): GeneralFieldMetadata[]{
        // const {onlyKeys, indexName} = options;
        // if(indexName){
        //     const key = this.secondaryKeys.find((key)=> (key.indexName == indexName && key.target == target))
        //     if(key?.isLocalIndex){
        //         const partitionKey = this.secondaryKeys.find((key)=> (key.isPartitionKey == true && key.target == target));
        //         return [partitionKey, key];
        //     }else if(key?.isGlobalIndex){

        //     }else{

        //     }
        // }
        const fields = this.fields.filter(field=>
             (field.target == target ))
        return fields
    }


    getTableMetaData(target: Function): TableClassMetadata{
        const table = this.tables.find(table => table.target == target)
        if (!table){
            throw Error("Can not find table metadata") 
        }
        return table
    }

}