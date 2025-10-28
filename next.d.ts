export {};

declare global {
  type SessionUser = {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string | null | undefined;
    userType?: string;
    role?: string;
    createdAt: string | Date;
    updatedAt: string | Date;
    twoFactorEnabled?: boolean | null | undefined;
  };
}
