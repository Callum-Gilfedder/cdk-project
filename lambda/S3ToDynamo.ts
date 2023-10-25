import * as AWS from 'aws-sdk';

const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName: string | undefined = process.env.TABLE_NAME;

// Environment variable validation
if (!tableName) {
    throw new Error("Environment variable TABLE_NAME is not set");
}

export const handler = async (event: any): Promise<void> => {
    try {
        const s3Event = event.Records[0].s3;
        console.log("Accessed s3event: ", s3Event);
        
        const decodedKey = decodeURIComponent(s3Event.object.key.replace(/\+/g, " "));
        const params = {
            Bucket: s3Event.bucket.name,
            Key: decodedKey
        };
        console.log("Set parameters: ", params);
        
        const s3Object = await s3.getObject(params).promise();
        if (s3Object.Body == undefined) {
            throw new Error("s3Object.Body is undefined")
        }
        const textData: string = s3Object.Body.toString('utf-8');
        console.log("Got s3Object: ", s3Object);
        
        await putIntoDynamo(decodedKey, textData);
        console.log("Data put into DynamoDB successfully.");
        
    } catch (error) {
        console.error("An error occurred: ", error);
    }
};

async function putIntoDynamo(decodedKey: string, textData: string) {
    console.log("Putting into dynamodb...");
    await dynamodb.put({
        TableName: tableName as string,
        Item: {
            id: decodedKey,
            data: textData
        }
    }).promise();
    console.log("DynamoDB entry added");
}
