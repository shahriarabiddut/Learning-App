import { User } from "@/models/users.model";
import { NextRequest, NextResponse } from "next/server";
import { AuthenticatedorNot } from "@/app/api/server/route";
import { PERMISSIONS } from "@/lib/middle/permissions";

export async function GET(request: NextRequest) {
  const user = await AuthenticatedorNot(request, {
    checkPermission: true,
    Permission: PERMISSIONS.MANAGE_USERS,
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
