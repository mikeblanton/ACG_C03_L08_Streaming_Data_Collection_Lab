const axios = require('axios');
const Kinesis = require('aws-sdk/clients/kinesis');
const _ = require('lodash');

const NUM_RESULTS = 100;
const STREAM_NAME = 'lab1'; // <-- Replace with your Kinesis Stream name

const exec = async () => {
  const kinesis = new Kinesis();
  const _params = {
    Data: '',
    StreamName: STREAM_NAME,
  }
  while (true) {
    const _users = await axios.get(`https://randomuser.me/api/?exc=login&results=${NUM_RESULTS}`);
    console.log('Users loaded', _users);
    const _record = _.sample(_users.data.results);
    console.log('User loaded', _record.name.first, _record.name.last);
    _params.Data = JSON.stringify({
      FIRST: _record.name.first,
      LAST: _record.name.last,
      AGE: _record.dob.age,
      LATITUDE: Number(_record.location.coordinates.latitude),
      LONGITUDE: Number(_record.location.coordinates.longitude),
    });
    _params.PartitionKey = `${new Date().getTime()}`
    // console.log('Sending record to Kinesis', _params);
    const _result = await kinesis.putRecord(_params).promise();
    console.log('Record sent to Kinesis', _result);
    await sleep(1000);
  }
}

const sleep = _ms => {
  return new Promise(resolve => setTimeout(resolve, _ms))
;}

exec();