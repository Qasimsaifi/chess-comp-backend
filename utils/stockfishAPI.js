const axios = require("axios");  

const getBestMove = async (fen, depth = 12) => {
  try {
    console.log(fen);
    
    // Chess-API.com endpoint
    const res = await axios.post('https://chess-api.com/v1', {
      fen: fen,
      depth: depth,
      variants: 1 // Number of variations to analyze
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    
    if (res?.data) {
      console.log(res?.data);
      
      // Chess-API returns the move directly in the response
      let bestmove = null;
      
      if (Array.isArray(res.data) && res.data.length > 0) {
        // Get the last message which should be type: 'bestmove'
        const bestMoveData = res.data.find(item => item.type === 'bestmove') || res.data[res.data.length - 1];
        bestmove = bestMoveData?.move || null; // Already in format like "e2e4"
      } else if (res.data.move) {
        bestmove = res.data.move;
      }
      
      return { 
        bestmove, 
        fen: res.data.fen || fen,
        evaluation: res.data.eval || null,
        depth: res.data.depth || depth
      };
    }
  } catch (error) {
    console.error('Chess API error:', error.message);
  }
  return { bestmove: null, fen: null };
};

module.exports = { getBestMove };