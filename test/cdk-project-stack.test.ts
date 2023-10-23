
import '@aws-cdk/assert/jest';
import { CdkProjectStack } from "../lib/cdk-project-stack";
import * as cdk from 'aws-cdk-lib';

test('CdkProjectStack', () => {
    const app = new cdk.App()
    const stack = new CdkProjectStack(app, 'MyTestStack')

    expect(stack).toHaveResource('AWS::S3::Bucket');
})