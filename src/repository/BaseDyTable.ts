import { getMetadataStorage } from '../metadata';
import { ClassType } from '../utils';
import { ClassConstructor } from 'class-transformer';
import {
	FieldsFilter,
	InputKeys,
	SortingKeyFilter,
} from '../utils';
import { dyDelete, dyGet, dyPut, dyQuery, dyScan, dyUpdate } from './crud';

export type DyObjectType<T> = { new (...args: any[]): T } | Function;

export abstract class BaseDyTable {

	private getTablePrimaryKeys<T extends BaseDyTable>(
		this: T,
		indexName?: string
	): [string, any][] {
		const metaDataFields = getMetadataStorage().getConstructorKeysMetaData(
			this.constructor,
			{ indexName }
		);
		const sortedKeys = Object.entries(this).filter(([key, _value]) => {
			if (key in metaDataFields) return true;
		});
		return sortedKeys;
	}

	static async dyScan<T extends BaseDyTable>(
		this: ClassType<T>,
		options: { filter?: FieldsFilter<T>; limit?: number },
		type?: DyObjectType<any>
	): Promise<T[]> {
		return dyScan(options, BaseDyTable.getDyObjectType(this, type));
	}


	static async dyQuery<T extends BaseDyTable>(
		this: DyObjectType<T>,
		partitionKeyValue: string | number,
		options: {
			filter?: FieldsFilter<T>;
			sortingKeyFilter?: SortingKeyFilter<T>;
			indexName?: string;
			limit?: number;
			scanForward?: boolean;
		} = {
			scanForward: false,
		},
		type?: DyObjectType<any>
	): Promise<T[]> {
		return dyQuery(
			partitionKeyValue,
			options,
			BaseDyTable.getDyObjectType(this, type)
		);
	}

	private static getDyObjectType<T>(
		defaultType: DyObjectType<T>,
		passedType?: DyObjectType<any>
	): ClassConstructor<T> {
		return <ClassConstructor<T>>passedType ?? defaultType;
	}

	static async dyGet<T>(
		this: DyObjectType<T>,
		keys: InputKeys,
		type?: DyObjectType<any>
	): Promise<T> {
		return dyGet(keys, BaseDyTable.getDyObjectType(this, type));
	}

	static async dyPut<T>(
		this: DyObjectType<T>,
		keys: InputKeys,
		type?: DyObjectType<any>
	): Promise<T> {
		return dyPut(keys, BaseDyTable.getDyObjectType(this, type));
	}

	public static dyDelete<T>(
		this: DyObjectType<T>,
		keys: InputKeys,
		type?: DyObjectType<any>
	): Promise<void> {
		return dyDelete(keys, BaseDyTable.getDyObjectType(this, type));
	}

	static async dyUpdate<T>(
		this: DyObjectType<T>,
		key: InputKeys,
		keys: InputKeys,
		type?: DyObjectType<any>
	): Promise<T> {
		return dyUpdate(key, keys, BaseDyTable.getDyObjectType(this, type));
	}

	async dyUpdate<T extends BaseDyTable>(this: T, keys: Partial<T>): Promise<T> {
		const key = this.getTablePrimaryKeys();
		return dyUpdate(key, keys, this.constructor as ClassType<T>);
    }
    async dyDelete<T extends BaseDyTable>(this: T): Promise<void>{
		const key = this.getTablePrimaryKeys();
		return dyDelete(key, this.constructor as ClassType<T>);
	}
}
