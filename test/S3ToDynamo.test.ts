import * as AWS from 'aws-sdk'; // Modified import syntax
import * as AWSMock from 'aws-sdk-mock'; // Modified import syntax
import { handler } from '../lambda/S3ToDynamo.ts'; // Update the path

// Mocking S3 getObject
AWSMock.mock('S3', 'getObject', (params: AWS.S3.GetObjectRequest, callback: Function) => {
    callback(null, { Body: Buffer.from('Mocked file content') });
});

// Capturing the parameters passed to DynamoDB put
let capturedParams: AWS.DynamoDB.DocumentClient.PutItemInput;

beforeAll(() => {
    process.env.TABLE_NAME = 'CdkProjectStack-TableCD117FA1-B1XTAXYVOKYK';
    AWSMock.mock('DynamoDB.DocumentClient', 'put', (params: AWS.DynamoDB.DocumentClient.PutItemInput, callback: Function) => {
        capturedParams = params;
        console.log("Captured Params:", capturedParams); // Log captured parameters for debugging
        callback(null, {}); // Assuming success
    });
});


// Ensure this environment variable is correctly set.

const testEvent = {
    "Records": [
      {
        "eventVersion": "2.0",
        "eventSource": "aws:s3",
        "awsRegion": "us-east-1",
        "eventTime": "1970-01-01T00:00:00.000Z",
        "eventName": "ObjectCreated:Put",
        "userIdentity": {
          "principalId": "EXAMPLE"
        },
        "requestParameters": {
          "sourceIPAddress": "127.0.0.1"
        },
        "responseElements": {
          "x-amz-request-id": "EXAMPLE123456789",
          "x-amz-id-2": "EXAMPLE123/5678abcdefghijklambdaisawesome/mnopqrstuvwxyzABCDEFGH"
        },
        "s3": {
          "s3SchemaVersion": "1.0",
          "configurationId": "testConfigRule",
          "bucket": {
            "name": "cdkprojectstack-inputbucket3bf8630a-1e0487ttp3nk0",
            "ownerIdentity": {
              "principalId": "A2HNE6SH8ANU21"
            },
            "arn": "arn:aws:s3:::cdkprojectstack-inputbucket3bf8630a-1e0487ttp3nk0"
          },
          "object": {
            "key": "testFile24.txt",
            "size": 1024,
            "eTag": "0123456789abcdef0123456789abcdef",
            "sequencer": "0A1B2C3D4E5F678901"
          }
        }
      }
    ]
  }


describe('Lambda Handler', () => {
    beforeAll(() => {
        process.env.TABLE_NAME = 'CdkProjectStack-TableCD117FA1-B1XTAXYVOKYK'
    });


    test('Check that lambda processes S3 event and interacts with DynamoDB correctly', async () => {
        await handler(testEvent);

        // Asserting that the correct parameters are passed to DynamoDB
        expect(capturedParams).toEqual({
            TableName: process.env.TABLE_NAME,
            Item: {
                id: testEvent.Records[0].s3.object.key,
                data: 'Mocked file content'
            }
        });
    });
});

// Restoring the mocks after all tests have run
afterAll(() => {
    AWSMock.restore('S3');
    AWSMock.restore('DynamoDB.DocumentClient');
    delete process.env.TABLE_NAME;
});


