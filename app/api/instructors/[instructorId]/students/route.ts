import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { instructorId: string } }) {
    try {
        // Fetch followers of the instructor
        const followers = await db.teacherFollower.findMany({
            where: {
                teacherId: params.instructorId,
            },
            select: {
                userId: true,
            },
        });

        // Extract unique follower user IDs
        const uniqueFollowerIds = Array.from(new Set(followers.map(follower => follower.userId)));

        // Limit to a specific number of followers
        const limitedFollowerIds = uniqueFollowerIds.slice(0, 4);

        // Fetch follower details (name, image) based on user IDs
        const followerDetails = await db.user.findMany({
            where: {
                id: {
                    in: limitedFollowerIds,
                },
            },
            select: {
                id: true,
                name: true,
                image: true,
            },
        });

        // Count total followers (distinct)
        const totalFollowersCount = uniqueFollowerIds.length;

        return NextResponse.json(
            { students: followerDetails, totalStudentsCount: totalFollowersCount },
            { status: 200 }
        );
    } catch (error) {
        console.error("[GET_INSTRUCTOR_FOLLOWERS]", error);
        return NextResponse.json(
            {
                error: 'Failed to fetch followers for instructor',
                students: [],
                totalStudentsCount: 0,
            },
            { status: 500 }
        );
    }
}

// import { db } from "@/lib/db";
// import { NextRequest, NextResponse } from "next/server";

// export async function GET(req: NextRequest, { params }: { params: { instructorId: string } }) {
//     try {
//         // Fetch all courses published by the instructor
//         const courses = await db.course.findMany({
//             where: {
//                 userId: params.instructorId
//             },
//             select: {
//                 id: true
//             }
//         });

//         // Extract course IDs from fetched courses
//         const courseIds = courses.map(course => course.id);

//         // Fetch all purchases for these courses
//         const purchases = await db.purchase.findMany({
//             where: {
//                 courseId: {
//                     in: courseIds
//                 }
//             },
//             select: {
//                 userId: true
//             }
//         });

//         // Extract unique userIds
//         const uniqueUserIds = Array.from(new Set(purchases.map(purchase => purchase.userId)));

//         // Limit to 4 unique userIds (students)
//         const limitedUniqueUserIds = uniqueUserIds.slice(0, 4);

//         // Fetch student details (name, image) based on userIds
//         const studentsDetails = await db.user.findMany({
//             where: {
//                 id: {
//                     in: limitedUniqueUserIds
//                 }
//             },
//             select: {
//                 id: true,
//                 name: true,
//                 image: true
//             }
//         });

//         // Count total number of enrolled students (distinct)
//         const totalStudentsCount = uniqueUserIds.length;

//         return NextResponse.json({ students: studentsDetails, totalStudentsCount }, { status: 200 });
//     } catch (error) {
//         console.error("[GET_INSTRUCTOR_COURSE_STUDENTS]", error);
//         return NextResponse.json({
//             error: 'Failed to fetch students for instructor courses',
//             students: [],
//             totalStudentsCount: 0
//         }, { status: 500 });
//     }
// }
