import mongoose, { Document, Schema } from "mongoose";

export interface IAccounts extends Document {
  accountId: string;
  providerId: string;
  userId: mongoose.Types.ObjectId;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

const AccountsSchema: Schema = new Schema(
  {
    accountId: { type: String, required: true, unique: true },
    providerId: { type: String, required: true, default: "credential" },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      validate: {
        validator: (v: string) => v.includes(":"), // Ensure salt:hash format
        message: "Password must be in hashed format",
      },
    },
  },
  {
    timestamps: true,
    collection: "account",
  }
);

AccountsSchema.index({ userId: 1, providerId: 1 }, { unique: true });

const Accounts =
  mongoose.models.Accounts ||
  mongoose.model<IAccounts>("Accounts", AccountsSchema);
export default Accounts;
