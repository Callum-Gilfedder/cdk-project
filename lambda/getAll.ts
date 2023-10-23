
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: any): Promise<{ statusCode: number, body: string | object }> => {
    const tableName: string | undefined = process.env.TABLE_NAME;

    const params = {
        TableName: tableName
    };

    try {
        const data = await dynamoDb.scan(params).promise();
        const fileData: string = data.Items.map((item: any) => `File name: ${item.id}, File content: ${item.data}`).join('\n');
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
