const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const tableName = process.env.TABLE_NAME; // Ensure you pass the table name as an environment variable to the Lambda function

    const params = {
        TableName: tableName
    };

    try {
        const data = await dynamoDb.scan(params).promise();
        const fileData = data.Items.map(item => `File name: ${item.id}, File content: ${item.data}`).join('\n');
        return {
            statusCode: 200,
            body: fileData
        };
    } catch (error) {
        console.error("Error fetching data from DynamoDB", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch data' })
        };
    }
};
