import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources'
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkProjectStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // input bucket where uploads go
    const inputBucket = new s3.Bucket(this, 'InputBucket', {
      versioned: false
    })

    // lambda function that extracts s3 file data and uploads to dynamodb.

    // dynamodb table where data from inputted files is entered
    const dynamoDbTable = new dynamodb.Table(this, 'Table', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    })

    const S3ToDynamo = new lambda.Function(this, 'S3ToDynamo', {
      runtime: lambda.Runtime.NODEJS_16_X, 
      code: lambda.Code.fromAsset('lambda'),
      handler: 'S3ToDynamo.handler',
      environment: {
        TABLE_NAME: dynamoDbTable.tableName, // passing table name as environment variable
      },
    })

    // event source for s3 put to trigger S3ToDynamo lambda
    const s3PutEventSource = new lambdaEventSources.S3EventSource(inputBucket, {
      events: [
        s3.EventType.OBJECT_CREATED_PUT
      ]
    });

    S3ToDynamo.addEventSource(s3PutEventSource);

    // output bucket where dynamodb entries data is extracted and saved here.
    const outputBucket = new s3.Bucket(this, 'OutputBucket', {
      versioned: false
    });
    // lambda function that extracts dynamodDB entry data and uploads to output s3.
    const DynamoToS3 = new lambda.Function(this, 'DynamoToS3', {
      runtime: lambda.Runtime.NODEJS_16_X, 
      code: lambda.Code.fromAsset('lambda'),
      handler: 'DynamoToS3.handler',
      environment: {
        BUCKET_NAME: outputBucket.bucketName, // passing table name as environment variable
      },
    })

    // Adding dynamodb stream event source
    const dynamoDbEventSource = new lambdaEventSources.DynamoEventSource(dynamoDbTable, {
      startingPosition: lambda.StartingPosition.LATEST
    })

    DynamoToS3.addEventSource(dynamoDbEventSource)

     // Grant permissions
    inputBucket.grantRead(S3ToDynamo);
    dynamoDbTable.grantWriteData(S3ToDynamo);
    dynamoDbTable.grantReadData(DynamoToS3); 
    outputBucket.grantPut(DynamoToS3);
  }
}
