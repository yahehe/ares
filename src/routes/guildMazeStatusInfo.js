const express = require('express');
const guildMazeStatusInfo = require('../services/guildMazeStatusInfo');

const router = new express.Router();

/**
 * Ingests guild maze status info
 */
router.post('/', async (req, res, next) => {
  const options = {
  };

  try {
    const result = await guildMazeStatusInfo.postGuildMazeStatusInfo(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    return res.status(500).send({
      status: 500,
      error: 'Server Error'
    });
  }
});

module.exports = router;
