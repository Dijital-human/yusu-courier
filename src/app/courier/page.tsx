"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Truck, 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  User,
  Phone,
  Mail,
  Loader2,
  Eye,
  Navigation,
  Wifi,
  WifiOff,
  Map,
  Zap,
  Target,
  Route
} from "lucide-react";
import { StatsCardSkeleton, TableSkeleton } from "@/components/ui/Skeleton";

interface CourierStats {
  totalDeliveries: number;
  pendingDeliveries: number;
  completedDeliveries: number;
  todayDeliveries: number;
  totalEarnings: number;
  averageRating: number;
  averageDeliveryTime: string;
  deliveriesByStatus: Array<{
    status: string;
    count: number;
  }>;
  recentDeliveries: number;
  monthlyDeliveries: Array<{
    month: string;
    count: number;
  }>;
}

interface RecentDelivery {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  status: string;
  createdAt: string;
  totalAmount: number;
  items: Array<{
    productName: string;
    quantity: number;
  }>;
}

export default function CourierDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<CourierStats | null>(null);
  const [recentDeliveries, setRecentDeliveries] = useState<RecentDelivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);

  // Online/Offline status toggle
  const toggleOnlineStatus = async () => {
    try {
      const response = await fetch("/api/courier/status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isOnline: !isOnline }),
      });

      if (response.ok) {
        setIsOnline(!isOnline);
        if (!isOnline) {
          // Get current location when going online
          getCurrentLocation();
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  useEffect(() => {
    if (status === "loading") return;

    // For testing purposes, skip authentication check
    // Test məqsədləri üçün autentifikasiya yoxlamasını keç
    // if (!session || session.user?.role !== "COURIER") {
    //   router.push("/auth/signin");
    //   return;
    // }

    fetchCourierData();
  }, [session, status, router]);

  const fetchCourierData = async () => {
    try {
      // Fetch Stats
      const statsRes = await fetch("/api/courier/stats");
      if (!statsRes.ok) throw new Error("Failed to fetch courier stats");
      const statsData = await statsRes.json();
      setStats(statsData);

      // Fetch Recent Deliveries
      const deliveriesRes = await fetch("/api/courier/deliveries?limit=5");
      if (!deliveriesRes.ok) throw new Error("Failed to fetch recent deliveries");
      const deliveriesData = await deliveriesRes.json();
      setRecentDeliveries(deliveriesData.deliveries || []);

    } catch (err: any) {
      setError(err.message || "An error occurred while fetching data.");
      console.error("Courier Dashboard Data Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-orange-100 text-orange-800";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Pending / Gözləyir";
      case "PROCESSING":
        return "Processing / İşlənir";
      case "SHIPPED":
        return "Shipped / Göndərilib";
      case "DELIVERED":
        return "Delivered / Çatdırılıb";
      case "CANCELLED":
        return "Cancelled / Ləğv edilib";
      default:
        return status;
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Courier Dashboard / Kuryer İdarə Paneli</h1>
            <p className="text-gray-600">Manage your delivery assignments / Çatdırılma tapşırıqlarını idarə edin</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TableSkeleton />
            <TableSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Error / Xəta</h1>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">
                Courier Control Center
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl leading-relaxed">
                Master your delivery game with real-time tracking, smart routing, and performance analytics.
                <br />
                <span className="text-cyan-400">Real-time GPS • Smart Routes • Performance Tracking</span>
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105 border-0 px-8 py-4 text-lg font-semibold">
                <Truck className="h-6 w-6 mr-3" />
                Go Online
              </Button>
              <Button variant="outline" className="border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 shadow-lg hover:shadow-cyan-400/25 transition-all duration-300 px-8 py-4 text-lg font-semibold">
                <Navigation className="h-6 w-6 mr-3" />
                View Map
              </Button>
            </div>
          </div>
        </div>

        {/* Live Map Section */}
        {isOnline && (
          <div className="mb-8">
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center text-2xl">
                  <Map className="h-8 w-8 mr-3 text-cyan-400" />
                  Live GPS Tracking
                </CardTitle>
                <p className="text-gray-400">Real-time location monitoring and route optimization</p>
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-gradient-to-br from-gray-900 to-black rounded-xl flex items-center justify-center border border-gray-700/50 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10"></div>
                  <div className="text-center relative z-10">
                    <div className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-cyan-400/30">
                      <Map className="h-10 w-10 text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">GPS Active</h3>
                    <p className="text-gray-400 mb-4">Real-time location tracking enabled</p>
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                      <p className="text-sm text-gray-300">
                        {currentLocation 
                          ? `📍 ${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}`
                          : "🔄 Getting your location..."
                        }
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                      <span className="text-sm text-gray-300">Online & Available</span>
                    </div>
                    <div className="flex items-center">
                      <Target className="h-5 w-5 text-cyan-400 mr-2" />
                      <span className="text-sm text-gray-300">GPS Tracking Active</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => getCurrentLocation()}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Update Location
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-sm border border-cyan-400/30 shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-300 text-sm font-medium mb-2">Total Deliveries</p>
                  <p className="text-4xl font-bold mb-2 text-white">{stats?.totalDeliveries || 0}</p>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mr-2"></div>
                    <span className="text-sm text-cyan-300">All time performance</span>
                  </div>
                </div>
                <div className="bg-cyan-500/20 backdrop-blur-sm rounded-2xl p-4 border border-cyan-400/50">
                  <Truck className="h-8 w-8 text-cyan-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-red-600/20 backdrop-blur-sm border border-orange-400/30 shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-300 text-sm font-medium mb-2">Active Orders</p>
                  <p className="text-4xl font-bold mb-2 text-white">{stats?.pendingDeliveries || 0}</p>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
                    <span className="text-sm text-orange-300">Ready for pickup</span>
                  </div>
                </div>
                <div className="bg-orange-500/20 backdrop-blur-sm rounded-2xl p-4 border border-orange-400/50">
                  <Clock className="h-8 w-8 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/20 to-teal-600/20 backdrop-blur-sm border border-emerald-400/30 shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-300 text-sm font-medium mb-2">Completed</p>
                  <p className="text-4xl font-bold mb-2 text-white">{stats?.completedDeliveries || 0}</p>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></div>
                    <span className="text-sm text-emerald-300">Successfully delivered</span>
                  </div>
                </div>
                <div className="bg-emerald-500/20 backdrop-blur-sm rounded-2xl p-4 border border-emerald-400/50">
                  <CheckCircle className="h-8 w-8 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-sm border border-purple-400/30 shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-300 text-sm font-medium mb-2">Today's Work</p>
                  <p className="text-4xl font-bold mb-2 text-white">{stats?.todayDeliveries || 0}</p>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                    <span className="text-sm text-purple-300">Today's deliveries</span>
                  </div>
                </div>
                <div className="bg-purple-500/20 backdrop-blur-sm rounded-2xl p-4 border border-purple-400/50">
                  <Package className="h-8 w-8 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats Cards / Əlavə Statistika Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Earnings / Ümumi Qazanc</p>
                  <p className="text-2xl font-bold text-gray-900">${stats?.totalEarnings?.toFixed(2) || "0.00"}</p>
                </div>
                <Package className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Rating / Orta Reytinq</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.averageRating?.toFixed(1) || "0.0"}/5.0</p>
                </div>
                <CheckCircle className="h-10 w-10 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Delivery Time / Orta Çatdırılma Vaxtı</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.averageDeliveryTime || "N/A"}</p>
                </div>
                <Clock className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions / Sürətli Əməliyyatlar */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions / Sürətli Əməliyyatlar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              className="flex items-center justify-center p-6 h-auto"
              onClick={() => router.push("/courier/orders")}
            >
              <Truck className="h-6 w-6 mr-2" />
              <div className="text-left">
                <div className="font-medium">View All Deliveries / Bütün Çatdırılmalar</div>
                <div className="text-sm opacity-90">Bütün çatdırılmalara bax</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="flex items-center justify-center p-6 h-auto"
              onClick={() => router.push("/courier/orders?status=PENDING")}
            >
              <Clock className="h-6 w-6 mr-2" />
              <div className="text-left">
                <div className="font-medium">Pending Deliveries / Gözləyən Çatdırılmalar</div>
                <div className="text-sm opacity-90">Gözləyən çatdırılmalara bax</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="flex items-center justify-center p-6 h-auto"
              onClick={() => router.push("/courier/profile")}
            >
              <User className="h-6 w-6 mr-2" />
              <div className="text-left">
                <div className="font-medium">My Profile / Mənim Profilim</div>
                <div className="text-sm opacity-90">Profil məlumatlarını yenilə</div>
              </div>
            </Button>
          </div>
        </div>

        {/* Main Content / Əsas Məzmun */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Deliveries / Son Çatdırılmalar */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Deliveries / Son Çatdırılmalar</CardTitle>
                <Button variant="outline" size="sm" onClick={() => router.push("/courier/orders")}>
                  <Eye className="h-4 w-4 mr-2" />
                  View All / Hamısına Bax
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentDeliveries.length > 0 ? (
                  recentDeliveries.map((delivery) => (
                    <div key={delivery.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{delivery.customerName}</p>
                        <p className="text-sm text-gray-600 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {delivery.address}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {delivery.customerPhone}
                        </p>
                        <p className="text-xs text-gray-500">{new Date(delivery.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900">${delivery.totalAmount.toFixed(2)}</p>
                        <Badge className={getStatusColor(delivery.status)}>
                          {getStatusLabel(delivery.status)}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500">No deliveries found / Çatdırılma tapılmadı.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Courier Info / Kuryer Məlumatları */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Courier Information / Kuryer Məlumatları
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-sm">{session?.user?.name || "N/A"}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-sm">{session?.user?.email || "N/A"}</span>
                </div>
                <div className="flex items-center">
                  <Truck className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-sm">Courier / Kuryer</span>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Earnings / Ümumi Qazanc:</span>
                    <span className="font-bold">${stats?.totalEarnings?.toFixed(2) || "0.00"}</span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-gray-600">Average Rating / Orta Reytinq:</span>
                    <span className="font-bold">{stats?.averageRating?.toFixed(1) || "0.0"}/5.0</span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-gray-600">Avg Delivery Time / Orta Çatdırılma Vaxtı:</span>
                    <span className="font-bold">{stats?.averageDeliveryTime || "N/A"}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}