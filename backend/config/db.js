import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.DATABASE_URL);
    console.log(`\nMongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error("MONGODB connection error: ", error);
    process.exit(1); // Exit with a non-zero code to indicate failure
  }
};

export default connectDB;