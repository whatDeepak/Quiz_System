import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { instructorId: string } }) {
  

    try {
        const user: any = await currentUser();
      const userId = user?.id ?? "";
  
      if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
        // Check if the current user follows the instructor
        const followStatus = await db.teacherFollower.findFirst({
            where: {
                teacherId: params.instructorId,
                userId: userId,
            },
        });

        const isFollowing = Boolean(followStatus);

        return NextResponse.json({ isFollowing }, { status: 200 });
    } catch (error) {
        console.error("[CHECK_FOLLOW_STATUS]", error);
        return NextResponse.json(
            { error: 'Failed to check follow status' },
            { status: 500 }
        );
    }
}


export async function POST(
    req: Request,
    { params }: { params: { instructorId: string } }
  ) {
    try {
      const user = await currentUser(); 
      const userId = user?.id ?? "";
  
      if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
  
      const { instructorId } = params;
  
      const existingFollow = await db.teacherFollower.findUnique({
        where: {
          userId_teacherId: {
            userId,
            teacherId: instructorId,
          },
        },
      });
  
      if (existingFollow) {
        return new NextResponse("Already following this teacher", { status: 409 });
      }
  
      const followTeacher = await db.teacherFollower.create({
        data: {
          userId,
          teacherId: instructorId,
        },
      });
  
      return NextResponse.json(followTeacher); 
    } catch (error) {
      console.error("[Follow_Teacher]", error);
      return new NextResponse("Internal Error", { status: 500 });
    }
  }
  
  export async function DELETE(
    req: Request,
    { params }: { params: { instructorId: string } }
  ) {
    try {
      const user = await currentUser(); 
      const userId = user?.id ?? "";
  
      if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
  
      const { instructorId } = params;
  
      const existingFollow = await db.teacherFollower.findUnique({
        where: {
          userId_teacherId: {
            userId,
            teacherId: instructorId,
          },
        },
      });
  
      if (!existingFollow) {
        return new NextResponse("Not following this teacher", { status: 404 });
      }
  
      const unfollowTeacher = await db.teacherFollower.delete({
        where: {
          userId_teacherId: {
            userId,
            teacherId: instructorId,
          },
        },
      });
  
      return NextResponse.json(unfollowTeacher); 
    } catch (error) {
      console.error("[Unfollow_Teacher]", error);
      return new NextResponse("Internal Error", { status: 500 });
    }
  }