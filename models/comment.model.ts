import mongoose, { Document, Schema } from "mongoose";

// Comment status enum
export enum CommentStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export interface IComment extends Document {
  id: string;
  post: Schema.Types.ObjectId | string;
  parentComment?: Schema.Types.ObjectId | string | null;
  name: string;
  email?: string | null;
  body: string;
  status?: CommentStatus;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const CommentSchema: Schema = new Schema(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "BlogPost",
      required: true,
      index: true,
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, default: null, trim: true },
    body: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(CommentStatus),
      default: CommentStatus.PENDING,
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: "comments",
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        ret.id = ret._id.toString();
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

CommentSchema.index({ post: 1, status: 1, isActive: 1 });
CommentSchema.index({ post: 1, parentComment: 1 });
CommentSchema.index({ createdAt: -1 });

const Comment =
  (mongoose.models?.Comment as mongoose.Model<IComment>) ||
  mongoose.model<IComment>("Comment", CommentSchema);

export default Comment;
