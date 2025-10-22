const mongoose = require('mongoose');

const MoveSchema = new mongoose.Schema({
  gameId: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
  move: { type: String, required: true },
  by: { type: String, enum: ['user', 'engine'], required: true },
  fenAfterMove: { type: String, required: true },
  time: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Move', MoveSchema);
