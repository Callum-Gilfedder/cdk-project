const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const maxRetries: number = 3;
const retryDelay: number = 1000;

export const handler = async (event: any): Promise<{ statusCode: number, body: string | object }> => {
    const tableName: string | undefined = process.env.TABLE_NAME;
    const params = {
        TableName: tableName
    };
    if (!tableName) {
        throw new Error('Environment variable TABLE_NAME is not set.');
    } 
    for (let attempts: number = 0; attempts < maxRetries; attempts++ ) {
        try {
            const data = await dynamoDb.scan(params).promise();
            console.log("Data: ", data)
            const fileData: string = data.Items.map((item: any) => `File name: ${item.id}, File content: ${item.data}`).join('\n');
            console.log("File content: ", fileData)
            return {
                statusCode: 200,
                body: fileData
            };
        } catch (error) {
            console.error("Error fetching data from DynamoDB", error);
            if (attempts < maxRetries) {
                console.log(`Retrying ${attempts + 1}/${maxRetries}...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            } 
        }
    }
    return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to fetch data' })
    };
};
