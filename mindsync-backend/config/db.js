const connectDB = async () => {
  try {
    console.log('MongoDB connection is disabled');
  } catch (error) {
    console.error(error);
  }
};

module.exports = connectDB;