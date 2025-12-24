"use client";

import type React from "react";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  Truck,
  Package,
  LogOut,
  Users,
  Car,
  FileText,
  ShoppingCart,
  Settings,
  LayoutDashboard,
  Route,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : "?";

  const navItems = [
    { href: "/admin", label: "Обзор", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Заказы", icon: ShoppingCart },
    { href: "/admin/itineraries", label: "Маршруты", icon: Route },
    { href: "/admin/drivers", label: "Водители", icon: Users },
    { href: "/admin/vehicles", label: "Автомобили", icon: Car },
    { href: "/admin/cargo-types", label: "Типы грузов", icon: Package },
    { href: "/admin/categories", label: "Категории ВУ", icon: FileText },
    { href: "/admin/brands", label: "Бренды", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Truck className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold">Админ-панель</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-xs text-muted-foreground">
                  Администратор
                </span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Выход</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 border-r bg-muted/30">
          <nav className="flex flex-col gap-1 p-4 w-full">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur">
          <nav className="flex justify-around p-2">
            {navItems.slice(0, 5).map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main content */}
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
      </div>

      <footer className="hidden md:block border-t bg-muted/30 py-6">
        <div className="px-4 text-center text-sm text-muted-foreground w-full">
          © 2025 Система грузоперевозок. Админ-панель.
        </div>
      </footer>
    </div>
  );
}
