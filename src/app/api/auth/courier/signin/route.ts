import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { signIn } from "next-auth/react";

const courierSigninSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = courierSigninSchema.parse(body);

    // Find courier user
    const courier = await db.user.findFirst({
      where: {
        email: validatedData.email,
        role: "COURIER",
        isActive: true,
      },
    });

    if (!courier) {
      return NextResponse.json(
        { error: "Invalid credentials or courier not found" },
        { status: 401 }
      );
    }

    // Check password (commented out for testing)
    // const isPasswordValid = await bcrypt.compare(
    //   validatedData.password,
    //   courier.password
    // );

    // if (!isPasswordValid) {
    //   return NextResponse.json(
    //     { error: "Invalid credentials" },
    //     { status: 401 }
    //   );
    // }

    // Update last login (commented out for testing)
    // await db.user.update({
    //   where: { id: courier.id },
    //   data: { lastLogin: new Date() },
    // });

    // Remove password from response (commented out for testing)
    // const { password, ...courierWithoutPassword } = courier;

    return NextResponse.json(
      {
        message: "Login successful",
        user: courier,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Courier signin error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to authenticate courier" },
      { status: 500 }
    );
  }
}
