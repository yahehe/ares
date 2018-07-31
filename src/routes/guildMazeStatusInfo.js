const express = require('express');
const logger = require('../lib/logger');
const guildMazeStatusInfo = require('../services/guildMazeStatusInfo');

const router = new express.Router({ mergeParams: true });

/**
 * Ingests guild maze status info
 */
router.post('/', async (req, res, next) => {
	const options = {
		guildId: req.params.guildId,
		mazeId: req.params.mazeId
	};
	logger.info(JSON.stringify(req.params));

	const result = await guildMazeStatusInfo.postGuildMazeStatusInfo(req.body, options);
	res.status(result.status || 200).send(result.data);
});

/**
 * Retrieve guild maze status info for a specific guild/maze
 */
router.get('/', async (req, res, next) => {
	const options = {
		guildId: req.params.guildId,
		mazeId: req.params.mazeId
	};
	logger.info(JSON.stringify(req.params));

	try {
		const result = await guildMazeStatusInfo.getGuildMazeStatusInfo(options);
		res.status(result.status || 200).send(result.data);
	} catch (err) {
		logger.error(err);
		return res.status(500).send({
			status: 500,
			error: 'Server Error'
		});
	}
});

module.exports = router;
