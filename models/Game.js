const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  name: { type: String },
  side: { type: String, enum: ['white', 'black'], required: true },
  fen: { type: String, required: true },
  status: { type: String, enum: ['ongoing', 'completed'], default: 'ongoing' },
  moves: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Game', GameSchema);
