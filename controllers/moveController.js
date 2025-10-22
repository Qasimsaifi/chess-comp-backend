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

const addMove = async (req, res, broadcast) => {
  const { gameId, move, by } = req.body;
  const game = await Game.findById(gameId);
  
  if (!game) return res.status(404).json({ message: 'Game not found' });

  const currentFen = game.fen;
  const newFen = applyUciMove(currentFen, move);
  
  if (!newFen) return res.status(400).json({ message: 'Invalid move' });

  await Move.create({ gameId, move, by, fenAfterMove: newFen });
  game.moves.push(move);
  game.fen = newFen;
  game.updatedAt = new Date();
  await game.save();

  if (broadcast) {
    broadcast({ type: 'update', gameId, fen: newFen, lastMove: move });
  }

  if (by === 'user') {
    const sf = await stockfish.getBestMove(newFen, 12);
    if (sf?.bestmove) {
      const newFen2 = applyUciMove(newFen, sf.bestmove);
      if (newFen2) {
        await Move.create({ gameId, move: sf.bestmove, by: 'engine', fenAfterMove: newFen2 });
        game.moves.push(sf.bestmove);
        game.fen = newFen2;
        game.updatedAt = new Date();
        await game.save();
        
        if (broadcast) {
          broadcast({ type: 'update', gameId, fen: newFen2, lastMove: sf.bestmove });
        }
        return res.json({ engineMove: sf.bestmove, newFen: newFen2 });
      }
    }
  }

  res.json({ engineMove: null, newFen });
};

const getMovesForGame = async (req, res) => {
  const { gameId } = req.params;
  const moves = await Move.find({ gameId }).sort({ time: 1 });
  res.json(moves);
};

module.exports = { addMove, getMovesForGame };
