const xray = require('aws-xray-sdk');
const AWS = xray.captureAWS(require('aws-sdk'));
AWS.config.update({region: 'us-east-1'});
let options = {};

const client = new AWS.DynamoDB.DocumentClient(options);

module.exports = client;