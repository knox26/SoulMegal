import mongoose from "mongoose";


const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    userName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    interests: [String],
    embedding: [Number],
    isOnline: {
      type : Boolean
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
