1. Create a S3 bucket

This S3 bucket will be used to store the data from the Kinesis stream. It will be the JSON files the lab is looking for.

2. Create a Kinesis Data Stream

Give it a stream name. You will need this at multiple points later.

3. Create an Analytics Application (Managed Apache Flink)

Create a new Streaming Application. Leave the setup method to be "Create from scratch". Give the application a name. Change the "Template for application settings" to be `Development`.

4. Update the IAM role permissions

From the Apache Flink application tab, edit the IAM role that was created. Add the following roles:

* `AmazonS3FullAccess`
* `KinesisReadOnlyAccess`

5. Create a Database in AWS Glue

Under "Data Catalog -> Databases", select `Add database`. Give it a name. None of the other items are needed.

Now, go back to Apache Flink, start your application (this takes a minute). When it's ready, open the Zeppelin notebook and start running these commands:

```
%flink.conf
execution.checkpointing.interval 5000
```

In the script below, you can set `USER_SOURCE_STREAM` references to whatever you want. In the string `'stream' = 'lab1'`, replace `lab1` with the name of the stream you created in Step 2.

```
%flink.ssql
     
DROP TABLE IF EXISTS USER_SOURCE_STREAM;
CREATE TABLE USER_SOURCE_STREAM (
FIRST STRING, LAST STRING, AGE INT, GENDER STRING, LATITUDE DOUBLE, LONGITUDE DOUBLE) WITH ('connector' = 'kinesis','stream' = 'lab1',
'aws.region' = 'us-east-1','scan.stream.initpos' = 'LATEST','format' = 'json');
```

In the script below, you can set `USER_DESTINATION_S3` references to whatever you want. Replace the S3 bucket location to what you created in Step 1.

```
%flink.ssql(type=update)

DROP TABLE IF EXISTS USER_DESTINATION_S3;
CREATE TABLE USER_DESTINATION_S3 (
FIRST STRING, LAST STRING, AGE INT, GENDER STRING, LATITUDE DOUBLE, LONGITUDE DOUBLE)
WITH ('connector' = 'filesystem','path' = 's3://blanton-lab1-data/','format' = 'json');
```

Replace the references to `USER_DESTINATION_S3` and `USER_SOURCE_STREAM` in the script below if you changed them in the previous scripts. This command will continue to run until you stop it.

```
%flink.ssql(type=update)
insert into USER_DESTINATION_S3
select FIRST, LAST, AGE, GENDER, LATITUDE, LONGITUDE FROM USER_SOURCE_STREAM WHERE AGE > 21;
```

Then, from your local machine, execute the sample script. Make sure you replace the value of `STREAM_NAME` on line 6 with the name of the stream you created on Line 2.
```
AWS_REGION=us-east-1 AWS_ACCESS_KEY_ID=<ACCESS_KEY> AWS_SECRET_ACCESS_KEY=<SECRET_KEY> node ./loadData.js
```
