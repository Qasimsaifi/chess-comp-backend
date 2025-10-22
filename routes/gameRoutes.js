const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

module.exports = (broadcast) => {
  router.post('/', (req, res) => gameController.createGame(req, res, broadcast));
  router.get('/', gameController.getGames);
  router.get('/:id', gameController.getGame);
  router.put('/:id', (req, res) => gameController.updateGame(req, res, broadcast));
  router.delete('/:id', (req, res) => gameController.deleteGame(req, res, broadcast));
  return router;
};
