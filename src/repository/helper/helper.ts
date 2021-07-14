import {
	generateObjFromArrays,
	objIsEmpty,
} from '../../utils/helper';

/**
 * this function return the expressionParams for updateItem function
 * AWS Doc:
 *      https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_UpdateItem.html
 * generated obj example, with BankAccount Table:
 * {
 *  UpdateExpression: 'set #name = :name , #iban = :iban',
 *  ExpressionAttributeValues: { ':name': 'EWDEWF', ':iban': '23432ERFREG4' },
 *  ExpressionAttributeNames: { '#name': 'name', '#iban': 'iban' }
 * }
 *
 * @param keys Item keys that need to be updated
 */
export const updateExpressionParams = (keys: any) => {
	if (objIsEmpty(keys) || keys === undefined) {
		throw Error("Update object can not be empty.");
	}
	const keysArray = Object.keys(keys);
	const valuesArray = Object.values(keys);
	// UpdateExpression
	const updateExpression = keysArray
		.map((key) => `#${key} = :${key}`)
		.join(' , ');
	// ExpressionAttributeValues
	const keysExpressionArray = keysArray.map((key) => `:${key}`);
	const attributeValues = generateObjFromArrays(
		keysExpressionArray,
		valuesArray
	);
	// ExpressionAttributeNames
	const keysNamesArray = keysArray.map((key) => `#${key}`);
	const attributeNames = generateObjFromArrays(keysNamesArray, keysArray);
	// Expression params
	const expressionParams = {
		UpdateExpression: `set ${updateExpression}`,
		ExpressionAttributeValues: attributeValues,
		ExpressionAttributeNames: attributeNames,
	};
	return expressionParams;
};
