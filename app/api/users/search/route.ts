import { PERMISSIONS } from "@/lib/middle/permissions";
import { User } from "@/models/users.model";
import { AuthenticatedorNot } from "@/services/dbAndPermission.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const user = await AuthenticatedorNot(request, {
    checkPermission: true,
    Permission: PERMISSIONS.VIEW_USERS,
  });
  if (user instanceof NextResponse) return user;

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.toLowerCase();

  if (!query) {
    return NextResponse.json([], { status: 200 });
  }

  try {
    const users = await User.find({
      name: { $regex: query, $options: "i" },
    })
      .select("name email image")
      .limit(10);

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
