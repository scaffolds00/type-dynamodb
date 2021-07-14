import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { FieldsFilter, KeyRange } from '../../utils';
import { objIsEmpty, generateObjFromArrays } from '../../utils/helper';


export type ArrayFilter<T> = Array<T>;
type filterOperations = "=" | "<>" | "begins_with" | "contains";
type filterEntries = [key: string, value: string | null, operation: filterOperations];
export type configFilter = DocumentClient.QueryInput & {
	ExpressionAttributeValues: DocumentClient.ExpressionAttributeValueMap;
	KeyConditionExpression: string;
};

export const filterExpression = (
	keys: FieldsFilter<any> = {},

): Partial<DocumentClient.QueryInput> => {
	if (objIsEmpty(keys)) {
		throw Error("Filter object can not be empty.");
	}

	const filterEntries = Object.entries(keys).filter(([_, value]) => !value?.range).map(([key, value]) => {
		let operation: filterOperations;
		let keyValue: string | undefined;
		if (value && "equal" in value) {
			operation = "=";
			keyValue = value.equal;
		}
		else if (value && "notEqual" in value) {
			operation = "<>"
			keyValue = value.notEqual
		}
		else if (value && "begins_with" in value) {
			operation = "begins_with"
			keyValue = value.begins_with;

		}
		else if (value && "contains" in value) {
			operation = "contains"
		}
		else {
			throw Error("Field filter can not be empty.");
		}
		return [key, keyValue, operation] as filterEntries;
	});
	const FilterExpression: any[] = [];
	const ExpressionAttributeValues: any = {};
	const ExpressionAttributeNames: any = {};
	//generate date range filter
	const filterRanges = Object.entries(keys).filter(([_, value]) => value?.range).map(([key, value]) => [key, value?.range] as [string,  KeyRange<any>]);

	filterRanges.forEach(([key, value]) => {
			const fieldString = key
			const rangeObj = value //as DateRangeType;
			ExpressionAttributeNames[`#${fieldString}`] = fieldString;
			if (rangeObj.from) {
				FilterExpression.push(
					`#${fieldString} >= :${fieldString}_from`
				);
				ExpressionAttributeValues[`:${fieldString}_from`] =
					rangeObj.from;
			}
			if (rangeObj.to) {
				FilterExpression.push(`#${fieldString} <= :${fieldString}_to`);
				ExpressionAttributeValues[`:${fieldString}_to`] = rangeObj.to;
			}
			if (!rangeObj.to && !rangeObj.from) {
				throw Error(
					'Filter object require at least range.to or range.from.'
				);
			}		
	});
	const [
		KeysFilterExpression,
		KeysExpressionAttributeValues,
		attributeNames,
	] = updateFilterParamters(
		filterEntries,
		);

	return {
		FilterExpression: [
			...FilterExpression,
			...KeysFilterExpression,
		].join(' AND '),
		ExpressionAttributeValues: {
			...ExpressionAttributeValues,
			...KeysExpressionAttributeValues,
		},
		ExpressionAttributeNames: {
			...ExpressionAttributeNames,
			...attributeNames,
		},
	};
};


/**
 * @return looks like with input ({ firstName: 'amro', lastName: 'Abd' }, "applicant"):
 * [ 'contains(applicant.firstName, :applicant_firstName)',
 *  'contains(applicant.lastName, :applicant_lastName)' ]
 * @param keys ie: {status: "WARTE_AUF_NUTZERANGABEN", moderization: true}
 * @param keyParent ie: "applicant"
 */
const keysToFilterExpressionList = (
	keys: filterEntries[]
): string[] => {
	return keys.map(([key, value, operation]) => {
		let cond: string;
		if (operation == 'contains') cond = ` contains(#${key}, :${key})`;
		else if (operation == 'begins_with') cond = ` begins_with(#${key}, :${key})`;
		else cond = `#${key} ${operation} :${key}`;
		return cond
		
	});
};



const updateFilterParamters = (
	filterKeys: filterEntries[],
) => {
	let FilterExpression: any[] = [];
	let ExpressionAttributeValues: any = {};
	let ExpressionAttributeNames: any = {};

	const mainKeysFilterExpressions = keysToFilterExpressionList(
		filterKeys
	);
	FilterExpression = FilterExpression.concat(mainKeysFilterExpressions);
	const inputKeysArray = filterKeys.map(([key, _]) => `:${key}`);
	const newItemObj = generateObjFromArrays(
		inputKeysArray,
		filterKeys.map(([_, value])=>value)
	);
	ExpressionAttributeValues = {
		...ExpressionAttributeValues,
		...newItemObj,
	};
	const keysNamesArray = filterKeys.map(([key, _]) => `#${key}`);
	const attributeNames = generateObjFromArrays(
		keysNamesArray,
		filterKeys.map(([_, value])=>value)
	);
	ExpressionAttributeNames = {
		...ExpressionAttributeNames,
		...attributeNames,
	};
	return [
		FilterExpression,
		ExpressionAttributeValues,
		ExpressionAttributeNames,
	];
};
