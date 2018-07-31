const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const addRequestId = require('express-request-id');
const xray = require('aws-xray-sdk');
const config = require('./lib/config');
const logger = require('./lib/logger');

const app = express();

xray.setLogger(logger);

app.use(xray.express.openSegment('Ares'));

app.use(addRequestId());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.use((req, res, next) => {
	req.logger = logger;
    const logIdBody = logger.child({
      id: req.id,
    }, true)
    logIdBody.info({
      req: req
    })
    next();
  });

  app.use((req, res, next) => {
    const afterResponse = () => {
        res.removeListener('finish', afterResponse);
        res.removeListener('close', afterResponse);
        const logId = logger.child({
            id: req.id
        }, true)
		logId.info({res:res}, 'response')
    }

    res.on('finish', afterResponse);
    res.on('close', afterResponse);
    next();
});
/*
 * Routes
 */
app.use('/guilds/:guildId/mazes/:mazeId', require('./routes/guilds'));
app.use('/guilds/:guildId/mazes/:mazeId/guildmazestatusinfo', require('./routes/guildMazeStatusInfo'));

app.use(xray.express.closeSegment());

// catch 404
app.use((req, res, next) => {
	logger.error(`Error 404 on ${req.url}.`);
	res.status(404).send({ status: 404, error: 'Not found' });
});

// catch errors
app.use((err, req, res, next) => {
	const status = err.status || 500;
	logger.error(`Error ${status} (${err.message}) on ${req.method} ${req.url} with payload ${req.body}.`);
	res.status(status).send({ status, error: 'Server error' });
});

module.exports = app;
