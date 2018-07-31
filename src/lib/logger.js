const bunyan = require('bunyan');
const bunyanExpressSerializer = require('bunyan-express-serializer');
const config = require('./config');

/**
 * @param {Object} config Logger configuration
 */
const getFromConfig = config => {
	const bunyanConfig = [];
	const levels = Object.keys(config.levels);

	levels.forEach(level => {
		const bunyanLevel = config.levels[level];
		if (!bunyanLevel) return;

		if (level === 'debug' && config.level !== 'debug') return;

		const logger = {level};

		if (bunyanLevel === 'STDOUT') {
			logger.stream = process.stdout;
		} else if (bunyanLevel === 'STDERR') {
			logger.stream = process.stderr;
		} else if (bunyanLevel) {
			logger.path = bunyanLevel;
		} else {
			return;
		}

		bunyanConfig.push(logger);
	});

	return bunyan.createLogger({ 
		name: config.name, 
		streams: bunyanConfig,
		serializers: {
			req: bunyanExpressSerializer,
			res: bunyan.stdSerializers.res,
			err: bunyan.stdSerializers.err
		},
	});;
};

const logger = getFromConfig(config.logger);

module.exports = logger;
