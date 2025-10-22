const express = require('express');
const router = express.Router();
const moveController = require('../controllers/moveController');

module.exports = (broadcast) => {
  router.post('/', (req, res) => moveController.addMove(req, res, broadcast));
  router.get('/:gameId', moveController.getMovesForGame);
  return router;
};