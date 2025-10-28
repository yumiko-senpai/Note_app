require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/notes';

const server = http.createServer(app);

const start = async () => {
  await connectDB(MONGO_URI);

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  start();
}

module.exports = { app, start, server };
