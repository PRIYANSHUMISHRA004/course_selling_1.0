
import mongoose from "mongoose";

export async function connectDB() {

  if (mongoose.connection.readyState >= 1) {
     console.log(`Radhe Radhe already connected`);
    return;
  }
 console.log(`Radhe Radhe connecting `);
  await mongoose.connect(process.env.MONGO_URL!);
  console.log(

  "Connected DB:",

  mongoose.connection.db?.databaseName

);
}