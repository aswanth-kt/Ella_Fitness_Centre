import mongoose, { Schema } from "mongoose";

const counterSchema = new Schema({
  name: { type: String, required: true, unique: true },
  sequence: { type: Number, default: 0 }
});

export default mongoose.model("Counter", counterSchema);