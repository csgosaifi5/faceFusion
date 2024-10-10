import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    photo: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
    },
    app_id: {
      type: String,
      required: false,
    },
    lastName: {
      type: String,
    },
    creditBalance: {
      type: Number,
      default: 10,
    },
    is_locked: {
      type: Boolean,
      default: true,
    },
    unlock_time: {
      type: Date,
      required: false,
    },
    expiry_time: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

const User = models?.User || model("User", UserSchema);

export default User;
