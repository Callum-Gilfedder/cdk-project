import { table } from "console";

const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName: string | undefined = process.env.TABLE_NAME;

export const handler = async (event: any): Promise<void> => {
    try {
        const s3Event = event.Records[0].s3;
        console.log("Accessed s3event: ", s3Event)
    
        console.log(s3Event);
    
        const decodedKey = decodeURIComponent(s3Event.object.key.replace(/\+/g, " "));
    
        const params = {
            Bucket: s3Event.bucket.name,
            Key: decodedKey
        };
        console.log("Set parameters: ", params);
    
        const s3Object = await s3.getObject(params).promise();
        const textData: string = s3Object.Body.toString('utf-8');
        console.log("Got s3Object: ", s3Object);
    
    
        console.log("tableName: ", tableName);
        console.log("Putting into dynamodb...");
        await dynamodb.put({
            TableName: tableName,
            Item: {
                id: decodedKey,
                data: textData
            }
        }).promise();
        console.log("DynamoDB entry added");
    } catch (error) {
        console.error("An error occurred: ", error)
    }
};
