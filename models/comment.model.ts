// import mongoose, { Document, Schema } from "mongoose";

// export interface IComment extends Document {
//   id: string;
//   post: Schema.Types.ObjectId | string;
//   parentComment?: Schema.Types.ObjectId | string | null;
//   name: string;
//   email?: string | null;
//   body: string;
//   approved?: boolean;
//   isActive?: boolean;
//   createdAt?: Date;
//   updatedAt?: Date;
// }

// const CommentSchema: Schema = new Schema(
//   {
//     post: {
//       type: Schema.Types.ObjectId,
//       ref: "BlogPost",
//       required: true,
//       index: true,
//     },
//     parentComment: {
//       type: Schema.Types.ObjectId,
//       ref: "Comment",
//       default: null,
//       index: true,
//     },
//     name: { type: String, required: true, trim: true },
//     email: { type: String, default: null, trim: true },
//     body: { type: String, required: true },
//     approved: { type: Boolean, default: false },
//     isActive: { type: Boolean, default: true },
//   },
//   {
//     timestamps: true,
//     collection: "comments",
//     toJSON: {
//       transform: function (doc, ret) {
//         delete ret.__v;
//         ret.id = ret._id.toString();
//         delete ret._id;
//       },
//     },
//     toObject: {
//       transform: function (doc, ret) {
//         delete ret.__v;
//         ret.id = ret._id.toString();
//         delete ret._id;
//       },
//     },
//   }
// );

// CommentSchema.index({ post: 1, approved: 1, isActive: 1 });
// CommentSchema.index({ post: 1, parentComment: 1 });
// CommentSchema.index({ createdAt: -1 });

// const Comment =
//   mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);

// export default Comment;
