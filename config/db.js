const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, { tlsInsecure: true });
    console.log(`MongoDB connecte: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Erreur MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
