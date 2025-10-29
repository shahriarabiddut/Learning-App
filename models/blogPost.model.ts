import mongoose, { Document, Schema } from "mongoose";

/**
 * Comment sub-document interface
 */
export interface IComment {
  name: string;
  email?: string | null;
  body: string;
  approved?: boolean;
  createdAt?: Date;
  replies?: IComment[]; // nested replies (optional)
}

/**
 * SEO metadata interface
 */
export interface ISeo {
  title?: string;
  description?: string;
  keywords?: string[]; // array of keywords
  canonicalUrl?: string | null;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string | null;
}

/**
 * Content block (optional rich structure for block editors)
 */
export interface IContentBlock {
  type: string; // e.g. "paragraph", "image", "code", "gallery", etc.
  data: Record<string, any>;
}

/**
 * Main BlogPost interface (Document)
 */
export interface IBlogPost extends Document {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string; // HTML or markdown depending on contentType
  contentBlocks?: IContentBlock[];
  contentType?: "html" | "markdown" | "blocks";
  author: Schema.Types.ObjectId | string; // ref: User
  authorName?: string;
  categories?: (Schema.Types.ObjectId | string)[];
  tags?: string[];
  featuredImage?: string;
  status?: "draft" | "published" | "archived";
  isActive?: boolean;
  isFeatured?: boolean;
  publishedAt?: Date | null;
  seo?: ISeo;
  allowComments?: boolean;
  comments?: IComment[];
  views?: number;
  readingTime?: number; // in minutes
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/* -------------------------------
   Sub-schemas
   ------------------------------- */

/* Comment Schema */
const CommentSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, default: null },
    body: { type: String, required: true },
    approved: { type: Boolean, default: false },
    replies: { type: [this], default: [] }, // allow nested replies (recursive) — note: mongoose handles this but be careful with deep nesting
  },
  { timestamps: { createdAt: true, updatedAt: false }, _id: true }
);

/* If you prefer to avoid recursion issues, you can comment out replies and use a flat structure. */

/* ContentBlock Schema (generic) */
const ContentBlockSchema = new Schema(
  {
    type: { type: String, required: true },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

/* SEO Schema */
const SeoSchema = new Schema(
  {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    keywords: { type: [String], default: [] },
    canonicalUrl: { type: String, default: null },
    ogTitle: { type: String, default: "" },
    ogDescription: { type: String, default: "" },
    ogImage: { type: String, default: null },
  },
  { _id: false }
);

/* -------------------------------
   Main BlogPost Schema
   ------------------------------- */
const BlogPostSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    }, // e.g. "how-to-use-nextjs"
    excerpt: { type: String, default: "" },
    content: { type: String, default: "" }, // HTML or Markdown
    contentBlocks: { type: [ContentBlockSchema], default: [] },
    contentType: {
      type: String,
      enum: ["html", "markdown", "blocks"],
      default: "html",
    },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, default: "" }, // denormalized for faster reads
    categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    tags: { type: [String], default: [] },
    featuredImage: { type: String, default: "" },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    isActive: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    publishedAt: { type: Date, default: null },
    seo: { type: SeoSchema, default: {} },
    allowComments: { type: Boolean, default: true },
    comments: { type: [CommentSchema], default: [] },
    views: { type: Number, default: 0, min: 0 },
    readingTime: { type: Number, default: 0, min: 0 }, // minutes
    createdBy: { type: String, default: "" },
    updatedBy: { type: String, default: "" },
  },
  {
    timestamps: true,
    collection: "posts",
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

/* Indexes for common queries */
// BlogPostSchema.index({ slug: 1 });
BlogPostSchema.index({ status: 1, publishedAt: -1 });
BlogPostSchema.index({ tags: 1 });
BlogPostSchema.index({ "seo.keywords": 1 });
BlogPostSchema.index({ views: -1, publishedAt: -1 });
BlogPostSchema.index({ author: 1, status: 1, isActive: 1 });
BlogPostSchema.index({ isFeatured: 1, status: 1, publishedAt: -1 });

/* Pre-save hook example: auto-set publishedAt when status changes to published */
BlogPostSchema.pre<IBlogPost>("save", function (next) {
  if (
    this.isModified("status") &&
    this.status === "published" &&
    !this.publishedAt
  ) {
    this.publishedAt = new Date();
    this.isActive = true;
  }
  next();
});

/* Optional: method to increment views atomically */
BlogPostSchema.methods.incrementViews = function () {
  return (this as any).updateOne({ $inc: { views: 1 } }).exec();
};

/* Export model */
const BlogPost =
  mongoose.models.BlogPost ||
  mongoose.model<IBlogPost>("BlogPost", BlogPostSchema);

export default BlogPost;
