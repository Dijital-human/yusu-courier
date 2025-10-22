import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcryptjs";

const courierSignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  vehicleType: z.enum(["MOTORCYCLE", "CAR", "BICYCLE", "VAN"]),
  licenseNumber: z.string().min(5, "License number must be at least 5 characters"),
  address: z.string().min(10, "Address must be at least 10 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = courierSignupSchema.parse(body);

    // Check if user already exists
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { phone: validatedData.phone },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email or phone already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create courier user
    const courier = await db.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        // password: hashedPassword, // Commented out for testing
        role: "COURIER",
        isActive: true,
        // isOnline: false, // Commented out for testing
        // Add courier-specific fields if needed
        // vehicleType: validatedData.vehicleType,
        // licenseNumber: validatedData.licenseNumber,
        // address: validatedData.address,
      },
    });

    // Remove password from response (commented out for testing)
    // const { password, ...courierWithoutPassword } = courier;

    return NextResponse.json(
      {
        message: "Courier account created successfully",
        user: courier,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Courier signup error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create courier account" },
      { status: 500 }
    );
  }
}
