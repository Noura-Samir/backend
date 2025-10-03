const mongoose = require("mongoose");

const connectDB = async () => {

  try {
    const conn = await mongoose.connect(
      "mongodb+srv://diaake97:123456di@cluster0.4jgpj0q.mongodb.net/ecommerce?retryWrites=true&w=majority",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }

};

module.exports = connectDB;
