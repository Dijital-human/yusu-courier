/**
 * Courier Database Connection Utility / Courier Veritabanı Bağlantı Utility-si
 * This utility provides a singleton Prisma client instance for courier module
 * Bu utility courier modulu üçün singleton Prisma client instance təmin edir
 */

import { PrismaClient } from '@prisma/client';

// Global variable to store Prisma client / Prisma client-i saxlamaq üçün global dəyişən
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Prisma client instance / Prisma client instance yarat
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// In development, store the client globally to prevent multiple instances / İnkişafda, çoxlu instance-ları qarşısını almaq üçün client-i global olaraq saxla
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Database connection test function / Veritabanı bağlantı test funksiyası
export async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Courier database connected successfully / Courier veritabanı uğurla bağlandı');
    return true;
  } catch (error) {
    console.error('❌ Courier database connection failed / Courier veritabanı bağlantısı uğursuz oldu:', error);
    return false;
  }
}

// Graceful shutdown function / Zərif bağlanma funksiyası
export async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    console.log('🔌 Courier database disconnected / Courier veritabanı bağlandı');
  } catch (error) {
    console.error('❌ Error disconnecting courier database / Courier veritabanı bağlama xətası:', error);
  }
}

// Health check function / Sağlamlıq yoxlama funksiyası
export async function healthCheck() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString() 
    };
  }
}

// Courier specific database functions / Courier xüsusi veritabanı funksiyaları
export async function getCourierStats(courierId: string) {
  try {
    const [
      totalDeliveries,
      completedDeliveries,
      pendingDeliveries,
      totalEarnings,
      averageRating
    ] = await Promise.all([
      prisma.order.count({ where: { courierId } }),
      prisma.order.count({ where: { courierId, status: 'DELIVERED' } }),
      prisma.order.count({ where: { courierId, status: { in: ['CONFIRMED', 'SHIPPED'] } } }),
      prisma.order.aggregate({
        where: { 
          courierId,
          status: 'DELIVERED'
        },
        _sum: { totalAmount: true }
      }),
      prisma.courier.findUnique({
        where: { userId: courierId },
        select: { rating: true }
      })
    ]);

    return {
      totalDeliveries,
      completedDeliveries,
      pendingDeliveries,
      totalEarnings: totalEarnings._sum.totalAmount || 0,
      averageRating: averageRating?.rating || 0
    };
  } catch (error) {
    console.error('Error fetching courier stats / Courier statistikalarını əldə etmə xətası:', error);
    return null;
  }
}

// Export default prisma client / Prisma client-i default olaraq export et
export default prisma;

// Export as db for compatibility / Uyğunluq üçün db kimi export et
export const db = prisma;
