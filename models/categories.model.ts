import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  parentCategory?: mongoose.Types.ObjectId | null | string;
  isActive: boolean;
  featured: boolean;
  demo?: boolean;
  addedBy: mongoose.Types.ObjectId | string;
  createdAt?: Date;
  updatedAt?: Date;
  parent?: string;
  user?: string;
}

const CategorySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    isActive: { type: Boolean, require: true, default: true },
    featured: { type: Boolean, default: false },
    demo: { type: Boolean, default: false },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "categorys",
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        if (!ret) return ret;

        // Convert _id to id and clean up
        if (ret._id && typeof ret._id.toString === "function") {
          ret.id = ret._id.toString();
        } else {
          ret.id = "Unknown ID";
        }
        delete ret._id;
        delete ret.__v;

        return ret;
      },
    },
  }
);

// Add compound index for unique category
CategorySchema.index({ name: 1 }, { unique: true });

// Add a virtual for child categorys (optional)
CategorySchema.virtual("children", {
  ref: "Category",
  localField: "_id",
  foreignField: "parentCategory",
});

// Virtual for parent category details
CategorySchema.virtual("parentDetails", {
  ref: "Category",
  localField: "parentCategory",
  foreignField: "_id",
  justOne: true,
});

// Pre-hook to ensure circular references don't break JSON.stringify
CategorySchema.set("toJSON", { virtuals: true });

// Check if model exists to avoid OverwriteModelError
const Category =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);

export default Category;
