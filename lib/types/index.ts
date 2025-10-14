import { IUser } from "@/models/users.model";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null | undefined;
  store: string | null | undefined;
  storeType: string;
  userType: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  twoFactorEnabled?: boolean | undefined;
  role: string;
  isActive: boolean;
}
export type ServerUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null;
  role?: string | null;
  store?: string | null;
  storeType?: string | null;
  userType?: string | null;
  isActive?: boolean | null;
  twoFactorEnabled?: boolean | null;
};

export interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: IUser | null;
  onUserCreated?: (user: { id: string; name: string; email: string }) => void;
}
