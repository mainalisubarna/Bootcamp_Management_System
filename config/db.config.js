import mongoose from "mongoose";
import "dotenv/config";
const DBURL = process.env.MONGO_URL;

export const dbConnection = async () => {
  const connection = await mongoose.connect(DBURL, {
    useNewUrlParser: true,
  });
  console.log("Mongo DB Connected", connection.connection.host);
};
