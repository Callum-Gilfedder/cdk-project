export {}

const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName: string | undefined = process.env.TABLE_NAME;

exports.handler = async (event: any): Promise<void> => {
    console.log("Accessing s3 event...");
    const s3Event = event.Records[0].s3;
    console.log(s3Event);
    console.log("Setting params...");
    const params = {
        Bucket: s3Event.bucket.name,
        Key: s3Event.object.key
    };

    console.log("Awaiting s3 getObject...");
    const s3Object = await s3.getObject(params).promise();
    const textData: string = s3Object.Body.toString('utf-8');

    console.log("Accessing tableName...");
    console.log("Putting into dynamodb...");
    await dynamodb.put({
        TableName: tableName,
        Item: {
            id: s3Event.object.key,
            data: textData
        }
    }).promise();
    console.log("DynamoDB entry added");
};
