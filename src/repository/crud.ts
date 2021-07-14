import { db } from './dbConnection';
import { updateExpressionParams } from './helper/helper';
import { ClassConstructor, plainToClass } from 'class-transformer';
import { ClassType } from '../utils';
import { getMetadataStorage } from '../metadata';
import {
	FieldsFilter,
	InputKeys,
	objIsEmpty,
	SortingKeyFilter,
	SortingKeyFilterOptions,
} from '../utils';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { configFilter, filterExpression } from './helper';


export const dyGet = async <T>(
	keys: InputKeys,
	type: ClassType<T>
): Promise<T> => {
	keys = { ...keys };
	const params = {
		TableName: getMetadataStorage().getTableMetaData(type).name,
		Key: keys,
	};
	const result = await db.get(params).promise();
	const item = result.Item;
	return plainToClass<T, any>(type, item);
};

/**
 * dynamoDelete
 * @param keys
 * @param type
 */
export const dyDelete = async <T>(
	keys: InputKeys,
	type: ClassType<T>
): Promise<void> => {
	const tableName = getMetadataStorage().getTableMetaData(type).name;
	keys = { ...keys };
	const params = {
		TableName: tableName,
		Key: keys,
	};
	try {
		await db.delete(params).promise();
	} catch (error) {
		throw error;
	}
};

export const dyPut = async <T>(keys: any, type: ClassType<T>): Promise<T> => {
	const params = {
		TableName: getMetadataStorage().getTableMetaData(type).name,
		Item: { ...keys },
	};
	await db.put(params).promise();
	return plainToClass<T, any>(type, keys);
};

export const dyUpdate = async <T>(
	key: InputKeys,
	keys: InputKeys,
	type: ClassType<T>
): Promise<T> => {
	const params = {
		TableName: getMetadataStorage().getTableMetaData(type).name,
		Key: { ...key },
		...updateExpressionParams(keys),
		ReturnValues: 'ALL_NEW',
	};
	const result = await db.update(params).promise();
	return plainToClass<T, any>(type, result.Attributes);
};

export const dyScan = async <T>(
	options: {
		filter?: FieldsFilter<T>;
		limit?: number;
	},
	type: ClassType<T>
): Promise<T[]> => {
	const { filter, limit } = options;
	let objItems: DocumentClient.ItemList = [];
	let lastKeyEvaluated = null;
	let queryCount = 0;
	let config: DocumentClient.ScanInput = {
		TableName: getMetadataStorage().getTableMetaData(type).name,
		ExpressionAttributeValues: {},
	};
	if (limit) {
		config.Limit = limit;
	}
	if (filter && Object.keys(filter).length !== 0) {
		const filterExpressionObj = filterExpression(filter); //TODO: NOT EQUAL
		if (filterExpressionObj.FilterExpression) {
			config.FilterExpression = filterExpressionObj.FilterExpression;
		}
		config.ExpressionAttributeValues = {
			...config.ExpressionAttributeValues,
			...filterExpressionObj.ExpressionAttributeValues,
		};
		if (!objIsEmpty(filterExpressionObj.ExpressionAttributeNames))
			config.ExpressionAttributeNames =
				filterExpressionObj.ExpressionAttributeNames;
	}
	do {
		if (lastKeyEvaluated) config.ExclusiveStartKey = lastKeyEvaluated;
		const data = await db.scan(config).promise();
		lastKeyEvaluated = data.LastEvaluatedKey;
		if (data.Items) objItems = [...objItems, ...data.Items];
		if (data.Count) {
			queryCount += data.Count;
		}
	} while (lastKeyEvaluated != null && (limit ? queryCount <= limit : true));

	const items = objItems.map((element) => {
		return plainToClass(type, element);
	});
	return items;
};

const addSortingKeyToKeyConditionExpression = (
	config: configFilter,
	filter: SortingKeyFilter<any>
): configFilter => {
	const [[key, value]] = Object.entries(filter) as [
		[string, SortingKeyFilterOptions<any>]
	];
	if (value.equal) {
		config.KeyConditionExpression += ` AND ${key} = :sortingKeyValue `;
		config.ExpressionAttributeValues[':sortingKeyValue'] = value.equal;
	} else if (value.begins_with) {
		config.KeyConditionExpression += ` AND begins_with(${key}, :sortingKeyValue) `;
		config.ExpressionAttributeValues[':sortingKeyValue'] =
			value.begins_with;
	} else if (value.range) {
		if (value.range.from && value.range.to)
			config.KeyConditionExpression += ` AND ${key}  BETWEEN :sortingKeyValueFrom AND :sortingKeyValueTo`;
		else if (value.range.from)
			config.KeyConditionExpression += ` AND ${key}  >= :sortingKeyValueFrom`;
		else if (value.range.to)
			config.KeyConditionExpression += ` AND ${key}  <= :sortingKeyValueTo`;
		if (value.range.from)
			config.ExpressionAttributeValues[':sortingKeyValueFrom'] =
				value.range.from;
		if (value.range.to)
			config.ExpressionAttributeValues[':sortingKeyValueTo'] =
				value.range.to;
	} else {
		throw Error('Unexpected filter key value.');
	}
	return config;
};

export const dyQuery = async <T>(
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
	type: ClassType<T>
): Promise<T[]> => {
	const { filter, indexName, limit, scanForward, sortingKeyFilter } = options;
	const partitionKeyMetaData = getMetadataStorage().getPartitionKey(
		type,
		indexName
	);
	let objItems: DocumentClient.ItemList = [];
	let lastKeyEvaluated = null;
	let queryCount = 0;
	let config: configFilter = {
		TableName: getMetadataStorage().getTableMetaData(type).name,
		KeyConditionExpression: `${partitionKeyMetaData.name} = :partitionKeyValue`,
		ExpressionAttributeValues: {
			':partitionKeyValue': partitionKeyValue,
		},
		ScanIndexForward: scanForward,
	};
	if (indexName) config.IndexName = indexName;
	if (limit) {
		config.Limit = limit;
	}

	if (sortingKeyFilter)
		config = addSortingKeyToKeyConditionExpression(
			config,
			sortingKeyFilter
		);
	if (
		filter &&
		Object.keys(filter).length !== 0
		//|| (notEqual && Object.keys(notEqual).length !== 0)
	) {
		const filterExpressionObj = filterExpression(filter); //TODO: NOT EQUAL
		if (filterExpressionObj.FilterExpression) {
			config.FilterExpression = filterExpressionObj.FilterExpression;
		}
		config.ExpressionAttributeValues = {
			...config.ExpressionAttributeValues,
			...filterExpressionObj.ExpressionAttributeValues,
		};
		if (!objIsEmpty(filterExpressionObj.ExpressionAttributeNames))
			config.ExpressionAttributeNames =
				filterExpressionObj.ExpressionAttributeNames;
	}
	do {
		if (lastKeyEvaluated) config.ExclusiveStartKey = lastKeyEvaluated;
		const data = await db.query(config).promise();
		lastKeyEvaluated = data.LastEvaluatedKey;
		if (data.Items) objItems = [...objItems, ...data.Items];
		if (data.Count) {
			queryCount += data.Count;
		}
	} while (lastKeyEvaluated != null && (limit ? queryCount <= limit : true));

	const items = objItems.map((element) => {
		return plainToClass(<ClassConstructor<T>>type, element);
	});
	return items;
};
