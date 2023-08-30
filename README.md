Create a Kinesis Stream
Create an Analytics Application
In the Zeppelin notebook:

```
%flink.conf
execution.checkpointing.interval 5000
```

```
%flink.ssql
     
DROP TABLE IF EXISTS USER_SOURCE_STREAM;
CREATE TABLE USER_SOURCE_STREAM (
FIRST STRING, LAST STRING, AGE INT, GENDER STRING, LATITUDE DOUBLE, LONGITUDE DOUBLE) WITH ('connector' = 'kinesis','stream' = 'lab1',
'aws.region' = 'us-east-1','scan.stream.initpos' = 'LATEST','format' = 'json');
```

```
%flink.ssql(type=update)

DROP TABLE IF EXISTS USER_DESTINATION_S3;
CREATE TABLE USER_DESTINATION_S3 (
FIRST STRING, LAST STRING, AGE INT, GENDER STRING, LATITUDE DOUBLE, LONGITUDE DOUBLE)
WITH ('connector' = 'filesystem','path' = 's3://blanton-lab1-data/','format' = 'json');
```

```
%flink.ssql(type=update)
insert into USER_DESTINATION_S3
select FIRST, LAST, AGE, GENDER, LATITUDE, LONGITUDE FROM USER_SOURCE_STREAM WHERE AGE > 21;
```

Then execute the sample script:
```
AWS_REGION=us-east-1 AWS_ACCESS_KEY_ID=<ACCESS_KEY> AWS_SECRET_ACCESS_KEY=<SECRET_KEY> node ./loadData.js
```
