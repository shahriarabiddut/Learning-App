import { AuthenticatedorNot, isSuperAdmin } from "@/app/api/server/route";
import { hashPassword } from "@/lib/helper/clientHelperfunc";
import { PERMISSIONS } from "@/lib/middle/permissions";
import Accounts from "@/models/accounts.model";
import { User } from "@/models/users.model";
import { userSchema } from "@/schemas/userSchema";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const user = await AuthenticatedorNot(request, {
    checkPermission: true,
    Permission: PERMISSIONS.MANAGE_USERS,
  });
  if (user instanceof NextResponse) return user;

  try {
    let query: any = {};
    const superAdmin = isSuperAdmin(user);

    const { searchParams } = new URL(request.url);
    let page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "9");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt-desc";
    const usertype = searchParams.get("usertype") || "";

    // Handle sorting
    const [field, order] = sortBy.split("-");
    const sort: Record<string, 1 | -1> = {
      [field]: order === "asc" ? 1 : -1,
    };

    if (usertype) {
      query.userType = usertype;
    }
    if (user.role === "admin" && !superAdmin) {
      query.role = { $ne: "admin" };
      query.userType = "user";
    }
    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
      page = 1; // Reset to page 1 when searching
    }

    const [rawData, total] = await Promise.all([
      User.find(query)
        .select("-password")
        .skip((page - 1) * limit)
        .limit(limit)
        .sort(sort),
      User.countDocuments(query),
    ]);

    const data = rawData.map((doc) => {
      const obj = doc.toObject();
      return {
        id: obj.id,
        name: obj.name,
        email: obj.email,
        role: obj.role,
        userType: obj.userType,
        isActive: obj.isActive,
        emailVerified: obj.emailVerified,
        image: obj.image,
        addedBy: obj.addedBy?.toString(),
        createdAt: obj.createdAt,
        updatedAt: obj.updatedAt,
      };
    });

    return NextResponse.json({
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const user = await AuthenticatedorNot(request, {
    checkPermission: true,
    Permission: PERMISSIONS.MANAGE_USERS,
  });
  if (user instanceof NextResponse) return user;

  try {
    const body = await request.json();
    const validation = userSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }
    const { password, ...userData } = validation.data;

    // Check for duplicate email
    if (await User.findOne({ email: userData.email })) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }
    // If you're not a SuperAdmin , You can't create One
    const superAdmin = isSuperAdmin(user);
    if (
      !superAdmin &&
      (userData.userType == "superadmin" || userData.userType == "admin")
    ) {
      return NextResponse.json({ error: "Wrong Command" }, { status: 400 });
    }
    const hashed = password && (await hashPassword(password));
    // Create user record
    const newUser = await User.create({
      ...userData,
      addedBy: user.id,
    });
    // Hash and store credentials

    await Accounts.create({
      accountId: newUser.id.toString(),
      providerId: "credential",
      userId: new mongoose.Types.ObjectId(newUser.id),
      password: hashed,
    });

    // Clean response
    const { password: _, ...safeUser } = newUser.toObject();
    revalidatePath("/dashboard/users");
    return NextResponse.json(safeUser, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
