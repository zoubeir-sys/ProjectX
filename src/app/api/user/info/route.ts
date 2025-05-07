import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

// Add this export to explicitly mark the route as dynamic
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // Get the authenticated user
    const user = await currentUser();
    console.log("Current user from Clerk:", user ? "Found" : "Not found");
    
    if (!user) {
      console.log("No authenticated user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract role from user metadata
    const role = user.publicMetadata.role as string;
    console.log("User role from metadata:", role || "No role found");
    
    // If no role is found, provide a default or error
    if (!role) {
      console.log("No role found in user metadata");
      return NextResponse.json({ 
        error: "User role not found in metadata" 
      }, { status: 400 });
    }

    // Return user info
    return NextResponse.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: role,
    });
  } catch (error) {
    console.error("Error in /api/user/info:", error);
    return NextResponse.json(
      { error: "Failed to fetch user information" }, 
      { status: 500 }
    );
  }
}


