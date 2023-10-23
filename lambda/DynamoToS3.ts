export {}
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const bucketName: string | undefined = process.env.BUCKET_NAME;

exports.handler = async (event: any): Promise<void> => {
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
                const itemString: string = JSON.stringify(itemJson, null, 2);

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
        }
    } catch (error) {
        console.error('Error:', error);
        throw new Error(error);
    }
};