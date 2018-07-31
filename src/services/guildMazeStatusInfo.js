const crypto = require('crypto');
const logger = require('../lib/logger');
const dynamodb = require('../lib/dynamodb');

const createId = (guildId, mazeId) => {
	const hash = crypto.createHash('sha256');
	return hash.update(String(guildId)).update(String(mazeId)).digest('hex');
};

const insert = async (tableName, baseItem, rawData) => {
	const params = {
		TableName: tableName,
		Item: {
			...baseItem,
			rawData,
		},
	};
	const dynamoItem = await dynamodb.put(params, (err, data) => {
		if (err) {
			logger.error(err);
		}
		return data;
	}).promise();
	return dynamoItem;
};

const get = async (tableName, id) => {
	const params = {
		TableName: tableName,
		Key: {
			id,
		},
	};
	const dynamoItem = await dynamodb.get(params, (err, data) => {
		if (err) {
			logger.error(err);
		}
		return data;
	}).promise();
	return dynamoItem.Item || {};
};

/**
 * @param {Object} options
 * @throws {Error}
 * @return {Promise}
 */
const postGuildMazeStatusInfo = async (body, options) => {
	logger.info(JSON.stringify(options));
	const { guildId, mazeId } = options;
	logger.info(JSON.stringify({guildId, mazeId}));
	const id = createId(guildId, mazeId);
	const timestamp = new Date().getTime();
  
	const {
		ts_val,
		tvalue,
		tvaluelocal,
		tzone,
		guildmaze_participation: guildMazeParticipation,
		setup_values: setupValues,
		guildmaze_map_info: guildMazeMapInfo,
		guildmaze_tiles: guildMazeTiles,
	} = body;

	const baseItem = {
		id,
		ts_val,
		tvalue,
		tvaluelocal,
		tzone,
		updatedAt: timestamp
	};
	const inserts = [];
	inserts.push(insert(process.env.GUILD_MAZE_STATUS_INFO, baseItem, {}));
	inserts.push(insert(process.env.GUILD_MAZE_STATUS_INFO_PARTICIPATION, baseItem, guildMazeParticipation));
	inserts.push(insert(process.env.GUILD_MAZE_STATUS_INFO_SETUP_VALUES, baseItem, setupValues));
	inserts.push(insert(process.env.GUILD_MAZE_STATUS_INFO_MAP_INFO, baseItem, guildMazeMapInfo));
	inserts.push(insert(process.env.GUILD_MAZE_STATUS_INFO_TILES, baseItem, guildMazeTiles));
	
	try {
		await Promise.all(inserts);
		logger.info(`Inserted all data for ${id}!`);
	} catch (e) {
		logger.error(e);
	}
	return {
		status: 200,
		data: 'postGuildMazeStatusInfo ok!'
	};
};

const getGuildMazeStatusInfo = async(options) => {
	const { guildId, mazeId } = options;
	const id = createId(guildId, mazeId);

	let info = {};
	try {
		info = await get(process.env.GUILD_MAZE_STATUS_INFO, id);
		info.guildMazeParticipation = await get(process.env.GUILD_MAZE_STATUS_INFO_PARTICIPATION, id);
		info.setupValues = await get(process.env.GUILD_MAZE_STATUS_INFO_SETUP_VALUES, id);
		info.guildMazeMapInfo = await get(process.env.GUILD_MAZE_STATUS_INFO_MAP_INFO, id);
		info.guildMazeTiles = await get(process.env.GUILD_MAZE_STATUS_INFO_TILES, id);
	} catch (e){
		logger.error(e);
	}
	return {
		status: 200,
		data: info,
	};
};

module.exports = {
	postGuildMazeStatusInfo,
	getGuildMazeStatusInfo,
};

