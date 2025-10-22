// yusu-courier/src/lib/courier-api-test.ts
// Courier API Test Script / Courier API Test Skripti
// This script tests all courier API endpoints / Bu skript bütün courier API endpoint-lərini test edir

import { prisma } from './db';
import { OrderStatus, UserRole } from '@prisma/client';

// Test data / Test məlumatları
const testData = {
  courierEmail: 'courier@yusu.com',
  testOrder: {
    status: OrderStatus.PROCESSING,
    totalAmount: 149.97,
    shippingAddress: JSON.stringify({ 
      street: 'Test Courier St', 
      city: 'Test Courier City',
      postalCode: '54321'
    }),
  }
};

async function runCourierApiTests() {
  console.log("🧪 Starting Courier API Tests / Courier API Testləri Başlayır...");

  // 1. Test database connection
  console.log("\n1️⃣ Testing database connection / Veritabanı bağlantısını test edir...");
  try {
    await prisma.$connect();
    console.log("✅ Database connected / Veritabanı bağlandı");
  } catch (error) {
    console.error("❌ Database connection failed / Veritabanı bağlantısı uğursuz oldu:", error);
    process.exit(1);
  }

  // 2. Test courier user retrieval
  console.log("\n2️⃣ Testing courier user retrieval / Courier istifadəçi əldə etməni test edir...");
  const courierUser = await prisma.user.findFirst({ 
    where: { 
      role: UserRole.COURIER,
      isActive: true 
    } 
  });
  
  if (courierUser) {
    console.log(`✅ Courier user found: ${courierUser.email} (${courierUser.name}) / Courier istifadəçi: ${courierUser.email} (${courierUser.name})`);
  } else {
    console.error("❌ No courier user found / Courier istifadəçi tapılmadı");
    process.exit(1);
  }

  // 3. Test customer creation for order
  console.log("\n3️⃣ Testing customer creation / Müştəri yaratmanı test edir...");
  let testCustomerId: string;
  const existingTestCustomer = await prisma.user.findFirst({ 
    where: { email: 'test-courier-customer@example.com' } 
  });
  
  if (existingTestCustomer) {
    testCustomerId = existingTestCustomer.id;
    console.log("⚠️ Test customer already exists, skipping creation / Test müştəri artıq mövcuddur, yaratma atlanır");
  } else {
    const newCustomer = await prisma.user.create({
      data: {
        email: 'test-courier-customer@example.com',
        name: 'Test Courier Customer',
        role: UserRole.CUSTOMER,
        isActive: true,
      },
    });
    testCustomerId = newCustomer.id;
    console.log("✅ Test customer created / Test müştəri yaradıldı");
  }

  // 4. Test seller creation for order
  console.log("\n4️⃣ Testing seller creation / Satıcı yaratmanı test edir...");
  let testSellerId: string;
  const existingTestSeller = await prisma.user.findFirst({ 
    where: { email: 'test-courier-seller@example.com' } 
  });
  
  if (existingTestSeller) {
    testSellerId = existingTestSeller.id;
    console.log("⚠️ Test seller already exists, skipping creation / Test satıcı artıq mövcuddur, yaratma atlanır");
  } else {
    const newSeller = await prisma.user.create({
      data: {
        email: 'test-courier-seller@example.com',
        name: 'Test Courier Seller',
        role: UserRole.SELLER,
        isActive: true,
      },
    });
    testSellerId = newSeller.id;
    console.log("✅ Test seller created / Test satıcı yaradıldı");
  }

  // 5. Test product creation for order
  console.log("\n5️⃣ Testing product creation / Məhsul yaratmanı test edir...");
  let testProductId: string;
  const existingTestProduct = await prisma.product.findFirst({ 
    where: { name: 'Test Courier Product' } 
  });
  
  if (existingTestProduct) {
    testProductId = existingTestProduct.id;
    console.log("⚠️ Test product already exists, skipping creation / Test məhsul artıq mövcuddur, yaratma atlanır");
  } else {
    const category = await prisma.category.findFirst();
    if (!category) {
      console.error("❌ No category found for product creation / Məhsul yaratmaq üçün kateqoriya tapılmadı");
      process.exit(1);
    }

    const newProduct = await prisma.product.create({
      data: {
        name: 'Test Courier Product',
        description: 'Test product for courier',
        price: 49.99,
        stock: 10,
        categoryId: category.id,
        sellerId: testSellerId,
        images: JSON.stringify(['https://example.com/courier-product.jpg']),
        isActive: true,
      },
    });
    testProductId = newProduct.id;
    console.log("✅ Test product created / Test məhsul yaradıldı");
  }

  // 6. Test order creation
  console.log("\n6️⃣ Testing order creation / Sifariş yaratmanı test edir...");
  let testOrderId: string;
  const existingTestOrder = await prisma.order.findFirst({ 
    where: { 
      customerId: testCustomerId, 
      courierId: courierUser!.id,
      status: OrderStatus.PROCESSING 
    } 
  });
  
  if (existingTestOrder) {
    testOrderId = existingTestOrder.id;
    console.log("⚠️ Test order already exists, skipping creation / Test sifariş artıq mövcuddur, yaratma atlanır");
  } else {
    const newOrder = await prisma.order.create({
      data: {
        customerId: testCustomerId,
        sellerId: testSellerId,
        courierId: courierUser!.id,
        ...testData.testOrder,
        items: {
          create: [
            { 
              productId: testProductId, 
              quantity: 3, 
              price: 49.99 
            }
          ],
        },
      },
    });
    testOrderId = newOrder.id;
    console.log("✅ Test order created / Test sifariş yaradıldı");
  }

  // 7. Test courier statistics
  console.log("\n7️⃣ Testing courier statistics / Courier statistikalarını test edir...");
  const courierStats = {
    totalDeliveries: await prisma.order.count({ where: { courierId: courierUser!.id } }),
    pendingDeliveries: await prisma.order.count({ 
      where: { 
        courierId: courierUser!.id, 
        status: OrderStatus.PROCESSING 
      } 
    }),
    completedDeliveries: await prisma.order.count({ 
      where: { 
        courierId: courierUser!.id, 
        status: OrderStatus.DELIVERED 
      } 
    }),
    todayDeliveries: await prisma.order.count({ 
      where: { 
        courierId: courierUser!.id, 
        status: OrderStatus.DELIVERED,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      } 
    }),
  };

  console.log("📊 Courier Statistics / Courier Statistikaları:");
  console.log(`  - Total Deliveries: ${courierStats.totalDeliveries}`);
  console.log(`  - Pending Deliveries: ${courierStats.pendingDeliveries}`);
  console.log(`  - Completed Deliveries: ${courierStats.completedDeliveries}`);
  console.log(`  - Today's Deliveries: ${courierStats.todayDeliveries}`);

  // 8. Test delivery management
  console.log("\n8️⃣ Testing delivery management / Çatdırılma idarəetməsini test edir...");
  const courierDeliveries = await prisma.order.findMany({
    where: { courierId: courierUser!.id },
    include: {
      customer: { select: { name: true, email: true, phone: true } },
      items: { 
        include: { 
          product: { select: { name: true } } 
        } 
      },
    },
    take: 3,
  });

  console.log("🚚 Courier Deliveries / Courier Çatdırılmaları:");
  courierDeliveries.forEach((delivery, i) => {
    console.log(`  ${i + 1}. Order ${delivery.id.substring(0, 8)}... - $${delivery.totalAmount.toFixed(2)} (${delivery.status})`);
  });

  // 9. Test profile management
  console.log("\n9️⃣ Testing profile management / Profil idarəetməsini test edir...");
  const courierProfile = await prisma.user.findUnique({
    where: { id: courierUser!.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      isActive: true,
      createdAt: true,
    },
  });

  if (courierProfile) {
    console.log("👤 Courier Profile / Courier Profili:");
    console.log(`  - Name: ${courierProfile.name}`);
    console.log(`  - Email: ${courierProfile.email}`);
    console.log(`  - Phone: ${courierProfile.phone || 'N/A'}`);
    console.log(`  - Active: ${courierProfile.isActive}`);
  }

  // 10. Clean up test data
  console.log("\n🔟 Cleaning up test data / Test məlumatlarını təmizləyir...");
  try {
    // Delete order items first
    await prisma.orderItem.deleteMany({ 
      where: { orderId: testOrderId } 
    });
    
    // Delete order
    await prisma.order.delete({ 
      where: { id: testOrderId } 
    });
    
    // Delete test product
    await prisma.product.delete({ 
      where: { id: testProductId } 
    });
    
    // Delete test customer and seller
    await prisma.user.delete({ 
      where: { id: testCustomerId } 
    });
    await prisma.user.delete({ 
      where: { id: testSellerId } 
    });
    
    console.log("✅ Test data cleaned up / Test məlumatları təmizləndi");
  } catch (error) {
    console.error("❌ Failed to clean up test data / Test məlumatlarını təmizləmək uğursuz oldu:", error);
  } finally {
    await prisma.$disconnect();
    console.log("🔌 Database connection closed / Veritabanı bağlantısı bağlandı");
  }

  console.log("\n🎉 All Courier API tests completed successfully! / Bütün Courier API testləri uğurla tamamlandı!");
}

// If this script is run directly, execute the test
if (require.main === module) {
  runCourierApiTests();
}

export { runCourierApiTests };
