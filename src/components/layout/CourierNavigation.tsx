"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Truck,
  Package,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { signOut } from "next-auth/react";

const navItems = [
  {
    href: "/courier",
    icon: LayoutDashboard,
    label: "Dashboard",
    labelAz: "İdarə Paneli",
  },
  {
    href: "/courier/orders",
    icon: Truck,
    label: "Deliveries",
    labelAz: "Çatdırılmalar",
  },
  {
    href: "/courier/profile",
    icon: User,
    label: "Profile",
    labelAz: "Profil",
  },
];

export default function CourierNavigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/signin" });
  };

  return (
    <>
      {/* Mobile Menu Button / Mobil Menyu Düyməsi */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Sidebar / Yan Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-gray-900 to-black border-r border-gray-700 shadow-2xl transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-200 ease-in-out`}
      >
        <div className="flex h-full flex-col justify-between p-4">
          {/* Logo and Title / Loqo və Başlıq */}
          <div className="flex items-center justify-center h-16 border-b border-gray-700 mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Yusu Courier</h1>
            </div>
          </div>

          {/* Navigation Links / Naviqasiya Linkləri */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} passHref>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start text-lg h-12 ${
                      isActive
                        ? "bg-green-600 text-white shadow-lg"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                    onClick={() => setIsOpen(false)} // Close sidebar on click
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.label} / {item.labelAz}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button / Çıxış Düyməsi */}
          <div className="mt-auto pt-6 border-t border-gray-700">
            <Button
              variant="ghost"
              className="w-full justify-start text-lg h-12 text-red-400 hover:bg-red-900/20 hover:text-red-300"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout / Çıxış
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile / Mobil üçün overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
}
