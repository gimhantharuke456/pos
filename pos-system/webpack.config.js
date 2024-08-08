const path = require("path");

module.exports = {
  // ... other configurations
  resolve: {
    fallback: {
      fs: false,
      path: false,
      crypto: false,
    },
  },
};
