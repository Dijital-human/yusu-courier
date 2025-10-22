/**
 * usePermissions Hook / usePermissions Hook
 * This hook provides permission checking functionality
 * Bu hook icazə yoxlama funksionallığını təmin edir
 */

import { useAuth } from './useAuth';

interface Permission {
  action: string;
  resource: string;
}

export function usePermissions() {
  const { user } = useAuth();

  const canAccess = (action: string, resource: string): boolean => {
    if (!user) return false;

    // Define role-based permissions / Rol əsaslı icazələri təyin et
    const rolePermissions: Record<string, Permission[]> = {
      COURIER: [
        { action: "read", resource: "deliveries" },
        { action: "update", resource: "deliveries" },
        { action: "read", resource: "profile" },
        { action: "update", resource: "profile" },
        { action: "update", resource: "status" },
      ],
      ADMIN: [
        // Admin has all permissions / Admin bütün icazələrə malikdir
        { action: "*", resource: "*" },
      ],
    };

    const userPermissions = rolePermissions[user.role as keyof typeof rolePermissions] || [];
    
    return userPermissions.some(perm => 
      (perm.action === "*" && perm.resource === "*") ||
      (perm.action === action && perm.resource === resource)
    );
  };

  const canAccessRoute = (path: string): boolean => {
    if (!user) return false;
    
    switch (path) {
      case "/courier":
      case "/courier/deliveries":
      case "/courier/profile":
        return user.role === "COURIER" || user.role === "ADMIN";
      case "/admin":
        return user.role === "ADMIN";
      default:
        return true;
    }
  };

  return {
    canAccess,
    canAccessRoute,
  };
}
