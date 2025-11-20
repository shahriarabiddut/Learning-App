import mongoose, { Document, Schema } from "mongoose";

/**
 * SEO metadata interface
 */
export interface ISeo {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string | null;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string | null;
}

/**
 * Content block (optional rich structure for block editors)
 */
export interface IContentBlock {
  type: string;
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
  content?: string;
  contentBlocks?: IContentBlock[];
  contentType?: "html" | "markdown" | "blocks";
  author: Schema.Types.ObjectId | string;
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
  commentsCount?: number;
  views?: number;
  readingTime?: number;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

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

const BlogPostSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    excerpt: { type: String, default: "" },
    content: { type: String, default: "" },
    contentBlocks: { type: [ContentBlockSchema], default: [] },
    contentType: {
      type: String,
      enum: ["html", "markdown", "blocks"],
      default: "html",
    },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, default: "" },
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
    commentsCount: { type: Number, default: 0, min: 0 },
    views: { type: Number, default: 0, min: 0 },
    readingTime: { type: Number, default: 0, min: 0 },
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

BlogPostSchema.index({ status: 1, publishedAt: -1 });
BlogPostSchema.index({ tags: 1 });
BlogPostSchema.index({ "seo.keywords": 1 });
BlogPostSchema.index({ views: -1, publishedAt: -1 });
BlogPostSchema.index({ author: 1, status: 1, isActive: 1 });
BlogPostSchema.index({ isFeatured: 1, status: 1, publishedAt: -1 });

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

BlogPostSchema.methods.incrementViews = function () {
  return (this as any).updateOne({ $inc: { views: 1 } }).exec();
};

const BlogPost =
  mongoose.models.BlogPost ||
  mongoose.model<IBlogPost>("BlogPost", BlogPostSchema);

export default BlogPost;
