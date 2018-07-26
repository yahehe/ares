const express = require('express');
const guilds = require('../services/guilds');

const router = new express.Router();

/**
 * Retrieve guild maze status info for a specific guild/maze
 */
router.get('/:guildId/mazes/:mazeId', async (req, res, next) => {
  const options = {
    guildId: req.params.guildId,
    mazeId: req.params.mazeId
  };

  try {
    const result = await guilds.getGuildsByGuildIdMazesByMazeId(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    return res.status(500).send({
      status: 500,
      error: 'Server Error'
    });
  }
});

module.exports = router;
