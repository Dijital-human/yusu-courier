import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { z } from "zod";

const statusUpdateSchema = z.object({
  isOnline: z.boolean(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export async function PUT(req: Request) {
  try {
    // For testing purposes, bypass authentication
    let courierId: string | undefined;
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "COURIER") {
      // Attempt to find a test courier if not authenticated
      const testCourier = await db.user.findFirst({
        where: { role: "COURIER" },
      });
      if (testCourier) {
        courierId = testCourier.id;
      } else {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } else {
      courierId = session.user.id;
    }

    const body = await req.json();
    const { isOnline, latitude, longitude } = statusUpdateSchema.parse(body);

    // Update courier status
    const updatedCourier = await db.user.update({
      where: { id: courierId },
      data: {
        isOnline: isOnline,
        lastSeen: new Date(),
        // You can add location fields to User model if needed
        // latitude: latitude,
        // longitude: longitude,
      },
    });

    return NextResponse.json({
      success: true,
      isOnline: updatedCourier.isOnline,
      lastSeen: updatedCourier.lastSeen,
    });
  } catch (error) {
    console.error("Error updating courier status:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    // For testing purposes, bypass authentication
    let courierId: string | undefined;
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "COURIER") {
      // Attempt to find a test courier if not authenticated
      const testCourier = await db.user.findFirst({
        where: { role: "COURIER" },
      });
      if (testCourier) {
        courierId = testCourier.id;
      } else {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } else {
      courierId = session.user.id;
    }

    const courier = await db.user.findUnique({
      where: { id: courierId },
      select: {
        id: true,
        isOnline: true,
        lastSeen: true,
        name: true,
        email: true,
      },
    });

    if (!courier) {
      return NextResponse.json({ error: "Courier not found" }, { status: 404 });
    }

    return NextResponse.json({
      isOnline: courier.isOnline,
      lastSeen: courier.lastSeen,
      name: courier.name,
      email: courier.email,
    });
  } catch (error) {
    console.error("Error fetching courier status:", error);
    return NextResponse.json(
      { error: "Failed to fetch status" },
      { status: 500 }
    );
  }
}
