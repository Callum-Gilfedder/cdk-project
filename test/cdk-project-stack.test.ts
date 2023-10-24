
import '@aws-cdk/assert/jest';
import { CdkProjectStack } from "../lib/cdk-project-stack";
import * as cdk from 'aws-cdk-lib';

const app = new cdk.App()
const stack = new CdkProjectStack(app, 'MyTestStack')

test('Stack should have a Lambda Function', () => {
    expect(stack).toHaveResource('AWS::Lambda::Function');
});

test('Stack should have a DynamoDB Table', () => {
    expect(stack).toHaveResource('AWS::DynamoDB::Table');
});


test('Stack should have an API Gateway', () => {
    expect(stack).toHaveResource('AWS::ApiGateway::RestApi');
});

test('Stack should have an SNS Topic', () => {
    expect(stack).toHaveResource('AWS::SNS::Topic');
});

test('SNS Topic should have an email subscription', () => {
    expect(stack).toHaveResourceLike('AWS::SNS::Subscription', {
        Protocol: 'email',
        Endpoint: 'cg@bluetel.co.uk',
    });
});

test('Stack should have an S3 Bucket', () => {
    expect(stack).toHaveResource('AWS::S3::Bucket');
});  