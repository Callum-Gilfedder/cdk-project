const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const bucketName = process.env.BUCKET_NAME;

exports.handler = async (event) => {
    console.log("Event: ", event)
    try {
        // Assuming the Lambda function is triggered by a DynamoDB Stream
        const records = event.Records;
        console.log("Records: ", records)
        if (records && records.length > 0) {
            const record = records[0];
            console.log("Record: ", record)

            // Ensure the event is an INSERT event, and a new item was added
            if (record.eventName === 'INSERT') {
                const newItem = record.dynamodb.NewImage;
                console.log("newItem: ", newItem)
                
                // Convert DynamoDB item to JSON
                const itemJson = AWS.DynamoDB.Converter.unmarshall(newItem);
                const itemString = JSON.stringify(itemJson, null, 2);

                console.log(itemJson.data)
                console.log(itemJson.id)

                // Define parameters for S3 upload
                const params = {
                    Bucket: bucketName,
                    Key: `${itemJson.id}`, 
                    Body: itemJson.data, 
                    ContentType: 'text/plain'
                };

                
                // Upload JSON file to S3
                console.log('Uploading data to S3')
                await s3.putObject(params).promise();
                console.log('Successfully uploaded data to S3');
            }
        }
    } catch (error) {
        console.error('Error:', error);
        throw new Error(error);
    }
};