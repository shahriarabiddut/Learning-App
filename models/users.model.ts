import { UserRole, UserType } from "@/lib/middle/roles";
import mongoose, { Schema, model, Document } from "mongoose";

// Define valid UserType for each UserRole
type AdminUserTypes = UserType.USER | UserType.EDITOR | UserType.SUPER_ADMIN;
type AuthorUserTypes =
  | UserType.TEACHER
  | UserType.PROGRAMMER
  | UserType.ENGINEER
  | UserType.DEVELOPER
  | UserType.DESIGNER
  | UserType.DATA_SCIENTIST
  | UserType.TECHNICAL_WRITER
  | UserType.ARCHITECT;
type RegularUserTypes =
  | UserType.STUDENT
  | UserType.COMMENTATOR
  | UserType.READER
  | UserType.CONTRIBUTOR
  | UserType.MODERATOR
  | UserType.REVIEWER;
type SubscriberUserTypes = UserType.USER;

// Conditional type that enforces userType based on role
type UserTypeForRole<R extends UserRole> = R extends UserRole.ADMIN
  ? AdminUserTypes
  : R extends UserRole.AUTHOR
  ? AuthorUserTypes
  : R extends UserRole.USER
  ? RegularUserTypes
  : R extends UserRole.SUBSCRIBER
  ? SubscriberUserTypes
  : UserType;

// Main interface with role-userType relationship
export interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  userType: UserType;
  password: string;
  emailVerified: boolean;
  image?: string;
  isActive: boolean;
  demo?: boolean;
  addedBy?: mongoose.Types.ObjectId | string | null;
  updatedBy?: mongoose.Types.ObjectId | string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Type-safe user types
export type IAdminUser = Omit<IUser, "role" | "userType"> & {
  role: UserRole.ADMIN;
  userType: AdminUserTypes;
};

export type IAuthorUser = Omit<IUser, "role" | "userType"> & {
  role: UserRole.AUTHOR;
  userType: AuthorUserTypes;
};

export type IRegularUser = Omit<IUser, "role" | "userType"> & {
  role: UserRole.USER;
  userType: RegularUserTypes;
};

export type ISubscriberUser = Omit<IUser, "role" | "userType"> & {
  role: UserRole.SUBSCRIBER;
  userType: SubscriberUserTypes;
};

// Union type for all possible users
export type ITypedUser =
  | IAdminUser
  | IAuthorUser
  | IRegularUser
  | ISubscriberUser;

export interface IUserPublic {
  id: string;
  name: string;
  role: UserRole;
  userType: UserType;
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
    role: {
      type: String,
      required: true,
      default: UserRole.USER,
      enum: Object.values(UserRole),
    },
    userType: {
      type: String,
      required: true,
      default: UserType.USER,
      enum: Object.values(UserType),
    },
    isActive: { type: Boolean, default: false },
    demo: { type: Boolean, default: false },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    emailVerified: { type: Boolean, default: false },
    image: { type: String },
  },
  {
    timestamps: true,
    collection: "user",
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

// Helper function for validation
const getValidUserTypesForRole = (role: UserRole): UserType[] => {
  switch (role) {
    case UserRole.ADMIN:
      return [UserType.USER, UserType.EDITOR, UserType.SUPER_ADMIN];
    case UserRole.AUTHOR:
      return [
        UserType.TEACHER,
        UserType.PROGRAMMER,
        UserType.ENGINEER,
        UserType.DEVELOPER,
        UserType.DESIGNER,
        UserType.DATA_SCIENTIST,
        UserType.TECHNICAL_WRITER,
        UserType.ARCHITECT,
      ];
    case UserRole.USER:
      return [
        UserType.STUDENT,
        UserType.COMMENTATOR,
        UserType.READER,
        UserType.CONTRIBUTOR,
        UserType.MODERATOR,
        UserType.REVIEWER,
      ];
    case UserRole.SUBSCRIBER:
      return [UserType.USER];
    default:
      return [UserType.USER];
  }
};

// Add validation middleware to enforce role-userType relationship
userSchema.pre("save", function (next) {
  const validUserTypes = getValidUserTypesForRole(this.role as UserRole);
  const isValid = validUserTypes.includes(this.userType as UserType);

  if (!isValid) {
    next(
      new Error(`Invalid userType "${this.userType}" for role "${this.role}"`)
    );
  } else {
    next();
  }
});

userSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate() as any;

  if (update.role || update.userType) {
    const role = update.role || (this as any)._conditions?.role;
    const userType = update.userType || (this as any)._conditions?.userType;

    if (role && userType) {
      const validUserTypes = getValidUserTypesForRole(role);
      if (!validUserTypes.includes(userType)) {
        next(new Error(`Invalid userType "${userType}" for role "${role}"`));
        return;
      }
    }
  }
  next();
});

// Create and export the model
export const User = mongoose.models.User || model<IUser>("User", userSchema);
