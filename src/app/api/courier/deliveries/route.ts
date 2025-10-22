import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { OrderStatus } from "@prisma/client";
import { z } from "zod";

// Delivery status update schema / Çatdırılma status yeniləmə sxemi
const deliveryStatusUpdateSchema = z.object({
  orderId: z.string().min(1, "Order ID is required / Sifariş ID tələb olunur"),
  status: z.nativeEnum(OrderStatus),
  notes: z.string().optional(),
  estimatedDeliveryTime: z.string().optional(),
});

/**
 * GET /api/courier/deliveries
 * Fetches deliveries for the authenticated courier.
 * Authenticated user must be a COURIER.
 *
 * @param {NextRequest} req - The incoming request.
 * @returns {NextResponse} - A response containing courier deliveries or an error.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "COURIER") {
      return NextResponse.json({ error: "Unauthorized / Yetkisiz" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    // Build where clause
    // Where şərtini qur
    const whereClause: any = {
      courierId: session.user.id,
    };

    // Add status filter
    if (status && status !== "all" && Object.values(OrderStatus).includes(status as OrderStatus)) {
      whereClause.status = status;
    }

    // Add search filter
    if (search) {
      whereClause.OR = [
        { id: { contains: search, mode: "insensitive" } },
        { customer: { name: { contains: search, mode: "insensitive" } } },
        { customer: { email: { contains: search, mode: "insensitive" } } },
        { customer: { phone: { contains: search, mode: "insensitive" } } },
      ];
    }

    const deliveries = await prisma.order.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    const totalCount = await prisma.order.count({
      where: whereClause,
    });

    // Format deliveries for easier consumption
    // Çatdırılmaları daha asan istifadə üçün formatla
    const formattedDeliveries = deliveries.map(delivery => ({
      id: delivery.id,
      orderId: delivery.id,
      customer: {
        id: delivery.customer?.id,
        name: delivery.customer?.name || "N/A",
        email: delivery.customer?.email || "N/A",
        phone: delivery.customer?.phone || "N/A",
      },
      address: delivery.shippingAddress,
      status: delivery.status,
      createdAt: delivery.createdAt.toISOString(),
      updatedAt: delivery.updatedAt.toISOString(),
      totalAmount: delivery.totalAmount,
      items: delivery.items.map(item => ({
        id: item.id,
        product: {
          id: item.product.id,
          name: item.product.name,
        },
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price,
      })),
    }));

    return NextResponse.json({
      deliveries: formattedDeliveries,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching courier deliveries:", error);
    return NextResponse.json({ error: "Internal server error / Daxili server xətası" }, { status: 500 });
  }
}

/**
 * PUT /api/courier/deliveries
 * Updates delivery status for the authenticated courier.
 * Authenticated user must be a COURIER and own the delivery.
 *
 * @param {NextRequest} req - The incoming request.
 * @returns {NextResponse} - A response indicating success or an error.
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "COURIER") {
      return NextResponse.json({ error: "Unauthorized / Yetkisiz" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input data
    const validatedFields = deliveryStatusUpdateSchema.safeParse(body);
    if (!validatedFields.success) {
      return NextResponse.json(
        { 
          error: "Validation error / Yoxlama xətası",
          details: validatedFields.error.errors 
        },
        { status: 400 }
      );
    }

    const { orderId, status, notes, estimatedDeliveryTime } = validatedFields.data;

    // Check if order exists and belongs to the courier
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found / Sifariş tapılmadı" }, { status: 404 });
    }

    if (existingOrder.courierId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized to update this delivery / Bu çatdırılmanı yeniləmək üçün icazəniz yoxdur" }, { status: 403 });
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        notes: notes || existingOrder.notes,
        estimatedDeliveryTime: estimatedDeliveryTime || existingOrder.estimatedDeliveryTime,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      message: "Delivery status updated successfully / Çatdırılma statusu uğurla yeniləndi",
      delivery: updatedOrder,
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating delivery status:", error);
    return NextResponse.json({ error: "Internal server error / Daxili server xətası" }, { status: 500 });
  }
}
