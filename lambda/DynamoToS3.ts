const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const bucketName: string | undefined = process.env.BUCKET_NAME;

// Environment variable validation
if (!bucketName) {
    throw new Error("Environment variable BUCKET_NAME is not set")
} 

export const handler = async (event: any): Promise<void> => {
    console.log("Event: ", event);
    try {
        const records = event.Records;
        console.log("Records: ", records);
        if (records && records.length > 0) {
            const record = records[0];
            console.log("Record: ", record);

            if (record.eventName === 'INSERT') {
                const newItem = record.dynamodb.NewImage;
                console.log("newItem: ", newItem);

                const itemJson = AWS.DynamoDB.Converter.unmarshall(newItem);
                await putIntoS3(itemJson)
            }
        }
    } catch (error: any) {
        console.error('An error occurred: ', error);
        throw new Error(error);
    }
};

async function putIntoS3(itemJson: any) {
    console.log(itemJson.data);
    console.log(itemJson.id);

    const params = {
        Bucket: bucketName,
        Key: `${itemJson.id}`,
        Body: itemJson.data,
        ContentType: 'text/plain'
    };

    console.log('Uploading data to S3');
    await s3.putObject(params).promise();
    console.log('Successfully uploaded data to S3');

}