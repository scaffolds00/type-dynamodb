import AWS from 'aws-sdk';
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service';

let DocumentClientOptions: AWS.DynamoDB.DocumentClient.DocumentClientOptions &
	ServiceConfigurationOptions = {};

DocumentClientOptions = { region: process.env.AWS_DEFAULT_REGION };

export const db = new AWS.DynamoDB.DocumentClient(DocumentClientOptions);
