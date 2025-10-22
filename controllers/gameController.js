const { Chess } = require('chess.js');
const Game = require('../models/Game');
const Move = require('../models/Move');
const stockfish = require('../utils/stockfishAPI');

const applyUciMove = (fen, uci) => {
  const chess = new Chess(fen);
  const from = uci.slice(0, 2);
  const to = uci.slice(2, 4);
  const promotion = uci.length > 4 ? uci[4] : undefined;
  const move = chess.move({ from, to, promotion });
  return move ? chess.fen() : null;
};

const createGame = async (req, res, broadcast) => {
  const { side, name } = req.body;
  const chess = new Chess();
  const startFen = chess.fen();
  
  const game = await Game.create({ name, side, fen: startFen, moves: [] });
  const gameId = game._id.toString();

  if (side === 'black') {
    const sf = await stockfish.getBestMove(startFen, 12);
    if (sf?.bestmove) {
      const newFen = applyUciMove(startFen, sf.bestmove);
      if (newFen) {
        await Move.create({ gameId, move: sf.bestmove, by: 'engine', fenAfterMove: newFen });
        game.fen = newFen;
        game.moves.push(sf.bestmove);
        game.updatedAt = new Date();
        await game.save();
        
        if (broadcast) {
          broadcast({ type: 'update', gameId, fen: newFen, lastMove: sf.bestmove });
        }
        return res.json({ gameId, fen: newFen, engineMove: sf.bestmove });
      }
    }
  }

  if (broadcast) {
    broadcast({ type: 'update', gameId, fen: startFen, lastMove: null });
  }
  res.json({ gameId, fen: startFen, engineMove: null });
};

const getGames = async (req, res) => {
  const games = await Game.find().sort({ createdAt: -1 });
  res.json(games);
};

const getGame = async (req, res) => {
  const { id } = req.params;
  const game = await Game.findById(id);
  if (!game) return res.status(404).json({ message: 'Game not found' });
  res.json(game);
};

const deleteGame = async (req, res, broadcast) => {
  const { id } = req.params;
  await Game.findByIdAndDelete(id);
  await Move.deleteMany({ gameId: id });
  
  if (broadcast) {
    broadcast({ type: 'delete', gameId: id });
  }
  res.json({ success: true });
};

const updateGame = async (req, res, broadcast) => {
  const { id } = req.params;
  const { name } = req.body;
  const game = await Game.findByIdAndUpdate(
    id,
    { name, updatedAt: new Date() },
    { new: true }
  );
  
  if (!game) return res.status(404).json({ message: 'Game not found' });
  
  if (broadcast) {
    broadcast({ type: 'updateGame', gameId: id, name });
  }
  res.json(game);
};

module.exports = { createGame, getGames, getGame, deleteGame, updateGame };
