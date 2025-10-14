import mongoose, { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  role: string;
  userType: string;
  password: string;
  emailVerified: boolean;
  image?: string;
  isActive: boolean;
  demo?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserPublic {
  id: string;
  name: string;
  role: string;
  userType: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  isActive: boolean;
  demo?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, required: false, default: "user" },
    userType: { type: String, required: false, default: "user" },
    isActive: { type: Boolean, default: false },
    demo: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    image: { type: String },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt
    collection: "user", // Explicitly set the collection name here
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v; // removes version key
        ret.id = ret._id.toString(); // converts _id to id
        delete ret._id;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        delete ret.__v;
        ret.id = ret._id.toString();
        delete ret._id;
      },
    },
  }
);

// Create and export the model
export const User = mongoose.models.User || model<IUser>("User", userSchema);
