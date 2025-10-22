/**
 * Courier Environment Variables Validation / Courier Mühit Dəyişənləri Doğrulama
 * This utility validates and provides type-safe access to courier environment variables
 * Bu utility courier environment variables-ları doğrulayır və type-safe giriş təmin edir
 */

import { z } from "zod";

// Courier environment schema definition / Courier mühit şeması tərifi
const courierEnvSchema = z.object({
  // Database / Veritabanı
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required / DATABASE_URL tələb olunur"),
  
  // NextAuth / NextAuth
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL / NEXTAUTH_URL etibarlı URL olmalıdır"),
  NEXTAUTH_SECRET: z.string().min(32, "NEXTAUTH_SECRET must be at least 32 characters / NEXTAUTH_SECRET ən azı 32 simvol olmalıdır"),
  
  // OAuth Providers / OAuth Provider-lər
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  FACEBOOK_CLIENT_ID: z.string().optional(),
  FACEBOOK_CLIENT_SECRET: z.string().optional(),
  APPLE_CLIENT_ID: z.string().optional(),
  APPLE_CLIENT_SECRET: z.string().optional(),
  
  // Payment Gateway / Ödəniş Gateway-i
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  // External APIs / Xarici API-lər
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),
  
  // Email Configuration / Email Konfiqurasiyası
  EMAIL_SERVER_HOST: z.string().optional(),
  EMAIL_SERVER_PORT: z.string().optional(),
  EMAIL_SERVER_USER: z.string().optional(),
  EMAIL_SERVER_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
  
  // Redis Configuration / Redis Konfiqurasiyası
  REDIS_URL: z.string().optional(),
  
  // Application Settings / Tətbiq Tənzimləri
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("3003"),
  
  // Security Settings / Təhlükəsizlik Tənzimləri
  CORS_ORIGIN: z.string().optional(),
  RATE_LIMIT_MAX: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.string().optional(),
  
  // Courier Specific Settings / Courier Xüsusi Tənzimləri
  COURIER_SESSION_TIMEOUT: z.string().optional(),
  COURIER_MAX_LOGIN_ATTEMPTS: z.string().optional(),
  
  // Logging Configuration / Logging Konfiqurasiyası
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  COURIER_LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).optional(),
  COURIER_AUDIT_LOG: z.string().optional(),
  COURIER_LOCATION_LOG: z.string().optional(),
  
  // File Upload Configuration / Fayl Yükləmə Konfiqurasiyası
  UPLOAD_DIR: z.string().default("./uploads"),
  MAX_FILE_SIZE: z.string().optional(),
  ALLOWED_FILE_TYPES: z.string().optional(),
  
  // Courier Panel Settings / Courier Panel Tənzimləri
  COURIER_PANEL_TITLE: z.string().optional(),
  COURIER_PANEL_DESCRIPTION: z.string().optional(),
  
  // Delivery Settings / Çatdırılma Tənzimləri
  COURIER_MAX_DELIVERIES_PER_DAY: z.string().optional(),
  COURIER_DELIVERY_RADIUS_KM: z.string().optional(),
  COURIER_DELIVERY_TIME_SLOT_MINUTES: z.string().optional(),
  
  // Location Tracking Settings / Məkan İzləmə Tənzimləri
  COURIER_LOCATION_UPDATE_INTERVAL: z.string().optional(),
  COURIER_LOCATION_ACCURACY_THRESHOLD: z.string().optional(),
  COURIER_GPS_REQUIRED: z.string().optional(),
  
  // Vehicle Settings / Nəqliyyat Vasitəsi Tənzimləri
  COURIER_VEHICLE_TYPES: z.string().optional(),
  COURIER_VEHICLE_VERIFICATION_REQUIRED: z.string().optional(),
  COURIER_INSURANCE_REQUIRED: z.string().optional(),
  
  // Payment Settings / Ödəniş Tənzimləri
  COURIER_PAYMENT_PER_DELIVERY: z.string().optional(),
  COURIER_PAYMENT_PER_KM: z.string().optional(),
  COURIER_MINIMUM_PAYOUT: z.string().optional(),
  COURIER_PAYOUT_SCHEDULE: z.string().optional(),
  
  // Notification Settings / Bildiriş Tənzimləri
  COURIER_EMAIL_NEW_DELIVERY: z.string().optional(),
  COURIER_EMAIL_DELIVERY_UPDATE: z.string().optional(),
  COURIER_EMAIL_PAYMENT_RECEIVED: z.string().optional(),
  COURIER_EMAIL_EMERGENCY: z.string().optional(),
  COURIER_SMS_NEW_DELIVERY: z.string().optional(),
  COURIER_SMS_DELIVERY_UPDATE: z.string().optional(),
  COURIER_SMS_EMERGENCY: z.string().optional(),
  COURIER_PUSH_NEW_DELIVERY: z.string().optional(),
  COURIER_PUSH_DELIVERY_UPDATE: z.string().optional(),
  COURIER_PUSH_EMERGENCY: z.string().optional(),
  
  // Safety Settings / Təhlükəsizlik Tənzimləri
  COURIER_EMERGENCY_CONTACT: z.string().optional(),
  COURIER_EMERGENCY_EMAIL: z.string().optional(),
  COURIER_PANIC_BUTTON: z.string().optional(),
  COURIER_DAILY_HEALTH_CHECK: z.string().optional(),
  COURIER_VEHICLE_SAFETY_CHECK: z.string().optional(),
  COURIER_DRUG_TEST_REQUIRED: z.string().optional(),
  
  // Routing Settings / Marşrut Tənzimləri
  COURIER_ROUTE_OPTIMIZATION: z.string().optional(),
  COURIER_TRAFFIC_AWARE: z.string().optional(),
  COURIER_WEATHER_AWARE: z.string().optional(),
  COURIER_DELIVERY_WINDOWS: z.string().optional(),
  COURIER_WEEKEND_DELIVERY: z.string().optional(),
  COURIER_HOLIDAY_DELIVERY: z.string().optional(),
});

// Environment validation function / Mühit doğrulama funksiyası
export function validateCourierEnv() {
  try {
    const env = courierEnvSchema.parse(process.env);
    console.log("✅ Courier environment variables validated successfully / Courier mühit dəyişənləri uğurla doğrulandı");
    return env;
  } catch (error) {
    console.error("❌ Courier environment validation failed / Courier mühit doğrulaması uğursuz oldu:");
    if (error instanceof z.ZodError) {
      error.issues.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
    }
    process.exit(1);
  }
}

// Type-safe environment variables / Type-safe mühit dəyişənləri
export type CourierEnv = z.infer<typeof courierEnvSchema>;

// Get environment variables with validation / Doğrulama ilə mühit dəyişənlərini əldə et
export const courierEnv = validateCourierEnv();

// Helper functions / Köməkçi funksiyalar
export const isDevelopment = courierEnv.NODE_ENV === "development";
export const isProduction = courierEnv.NODE_ENV === "production";
export const isTest = courierEnv.NODE_ENV === "test";

// Courier specific helpers / Courier xüsusi köməkçiləri
export const getCourierSessionTimeout = () => {
  return courierEnv.COURIER_SESSION_TIMEOUT ? parseInt(courierEnv.COURIER_SESSION_TIMEOUT) : 14400000; // 4 hours default
};

export const getCourierMaxLoginAttempts = () => {
  return courierEnv.COURIER_MAX_LOGIN_ATTEMPTS ? parseInt(courierEnv.COURIER_MAX_LOGIN_ATTEMPTS) : 3;
};

export const getCourierLogLevel = () => {
  return courierEnv.COURIER_LOG_LEVEL || courierEnv.LOG_LEVEL;
};

export const isCourierAuditLogEnabled = () => {
  return courierEnv.COURIER_AUDIT_LOG === "true";
};

export const isCourierLocationLogEnabled = () => {
  return courierEnv.COURIER_LOCATION_LOG === "true";
};

export const getCourierPanelConfig = () => {
  return {
    title: courierEnv.COURIER_PANEL_TITLE || "Yusu Courier Panel",
    description: courierEnv.COURIER_PANEL_DESCRIPTION || "Yusu E-commerce Courier Management System",
  };
};

export const getDeliveryConfig = () => {
  return {
    maxDeliveriesPerDay: courierEnv.COURIER_MAX_DELIVERIES_PER_DAY ? parseInt(courierEnv.COURIER_MAX_DELIVERIES_PER_DAY) : 50,
    deliveryRadiusKm: courierEnv.COURIER_DELIVERY_RADIUS_KM ? parseInt(courierEnv.COURIER_DELIVERY_RADIUS_KM) : 25,
    timeSlotMinutes: courierEnv.COURIER_DELIVERY_TIME_SLOT_MINUTES ? parseInt(courierEnv.COURIER_DELIVERY_TIME_SLOT_MINUTES) : 30,
  };
};

export const getLocationTrackingConfig = () => {
  return {
    updateInterval: courierEnv.COURIER_LOCATION_UPDATE_INTERVAL ? parseInt(courierEnv.COURIER_LOCATION_UPDATE_INTERVAL) : 30000,
    accuracyThreshold: courierEnv.COURIER_LOCATION_ACCURACY_THRESHOLD ? parseInt(courierEnv.COURIER_LOCATION_ACCURACY_THRESHOLD) : 100,
    gpsRequired: courierEnv.COURIER_GPS_REQUIRED === "true",
  };
};

export const getVehicleConfig = () => {
  return {
    types: courierEnv.COURIER_VEHICLE_TYPES ? courierEnv.COURIER_VEHICLE_TYPES.split(",") : ["BIKE", "MOTORCYCLE", "CAR", "VAN"],
    verificationRequired: courierEnv.COURIER_VEHICLE_VERIFICATION_REQUIRED === "true",
    insuranceRequired: courierEnv.COURIER_INSURANCE_REQUIRED === "true",
  };
};

export const getPaymentConfig = () => {
  return {
    perDelivery: courierEnv.COURIER_PAYMENT_PER_DELIVERY ? parseFloat(courierEnv.COURIER_PAYMENT_PER_DELIVERY) : 5.00,
    perKm: courierEnv.COURIER_PAYMENT_PER_KM ? parseFloat(courierEnv.COURIER_PAYMENT_PER_KM) : 0.50,
    minimumPayout: courierEnv.COURIER_MINIMUM_PAYOUT ? parseFloat(courierEnv.COURIER_MINIMUM_PAYOUT) : 25.00,
    schedule: courierEnv.COURIER_PAYOUT_SCHEDULE || "weekly",
  };
};

export const getNotificationConfig = () => {
  return {
    email: {
      newDelivery: courierEnv.COURIER_EMAIL_NEW_DELIVERY === "true",
      deliveryUpdate: courierEnv.COURIER_EMAIL_DELIVERY_UPDATE === "true",
      paymentReceived: courierEnv.COURIER_EMAIL_PAYMENT_RECEIVED === "true",
      emergency: courierEnv.COURIER_EMAIL_EMERGENCY === "true",
    },
    sms: {
      newDelivery: courierEnv.COURIER_SMS_NEW_DELIVERY === "true",
      deliveryUpdate: courierEnv.COURIER_SMS_DELIVERY_UPDATE === "true",
      emergency: courierEnv.COURIER_SMS_EMERGENCY === "true",
    },
    push: {
      newDelivery: courierEnv.COURIER_PUSH_NEW_DELIVERY === "true",
      deliveryUpdate: courierEnv.COURIER_PUSH_DELIVERY_UPDATE === "true",
      emergency: courierEnv.COURIER_PUSH_EMERGENCY === "true",
    },
  };
};

export const getSafetyConfig = () => {
  return {
    emergencyContact: courierEnv.COURIER_EMERGENCY_CONTACT || "+994501234567",
    emergencyEmail: courierEnv.COURIER_EMERGENCY_EMAIL || "emergency@yusu.com",
    panicButton: courierEnv.COURIER_PANIC_BUTTON === "true",
    dailyHealthCheck: courierEnv.COURIER_DAILY_HEALTH_CHECK === "true",
    vehicleSafetyCheck: courierEnv.COURIER_VEHICLE_SAFETY_CHECK === "true",
    drugTestRequired: courierEnv.COURIER_DRUG_TEST_REQUIRED === "true",
  };
};

export const getRoutingConfig = () => {
  return {
    optimization: courierEnv.COURIER_ROUTE_OPTIMIZATION === "true",
    trafficAware: courierEnv.COURIER_TRAFFIC_AWARE === "true",
    weatherAware: courierEnv.COURIER_WEATHER_AWARE === "true",
    deliveryWindows: courierEnv.COURIER_DELIVERY_WINDOWS ? courierEnv.COURIER_DELIVERY_WINDOWS.split(",") : ["09:00-12:00", "13:00-17:00", "18:00-21:00"],
    weekendDelivery: courierEnv.COURIER_WEEKEND_DELIVERY === "true",
    holidayDelivery: courierEnv.COURIER_HOLIDAY_DELIVERY === "true",
  };
};

// All helpers are already exported individually above
