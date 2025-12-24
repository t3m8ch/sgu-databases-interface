"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Order, OrderStatus } from "@/lib/types";
import { Loader2, MapPin, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusMap = {
  pending: { label: "Ожидает назначения", variant: "secondary" as const },
  in_transit: { label: "В пути", variant: "default" as const },
  delivered: { label: "Доставлен", variant: "outline" as const },
};

export default function AdminOrdersPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/login");
      return;
    }

    loadOrders();
  }, [isAuthenticated, user, router]);

  const loadOrders = () => {
    const allOrders: Order[] = JSON.parse(
      localStorage.getItem("orders") || "[]",
    );
    setOrders(allOrders);
    setLoading(false);
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const allOrders: Order[] = JSON.parse(
      localStorage.getItem("orders") || "[]",
    );
    const updatedOrders = allOrders.map((order) =>
      order.id === orderId ? { ...order, status: newStatus } : order,
    );

    localStorage.setItem("orders", JSON.stringify(updatedOrders));
    loadOrders();

    toast({
      title: "Статус обновлен",
      description: `Статус заказа №${orderId.slice(-6)} изменен на "${statusMap[newStatus].label}"`,
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold">Управление заказами</h1>
            <p className="text-muted-foreground mt-1">
              Просмотр и изменение статусов заказов
            </p>
          </div>

          {orders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-muted p-6 mb-4">
                  <Package className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Нет заказов</h3>
                <p className="text-muted-foreground">
                  Заказы появятся здесь после создания клиентами
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg">
                          Заказ №{order.id.slice(-6)}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Создан{" "}
                          {new Date(order.createdAt).toLocaleString("ru-RU")}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={statusMap[order.status].variant}>
                          {statusMap[order.status].label}
                        </Badge>
                        <Select
                          value={order.status}
                          onValueChange={(value) =>
                            updateOrderStatus(order.id, value as OrderStatus)
                          }
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">
                              Ожидает назначения
                            </SelectItem>
                            <SelectItem value="in_transit">В пути</SelectItem>
                            <SelectItem value="delivered">Доставлен</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Адрес доставки</p>
                          <p className="text-sm text-muted-foreground">
                            {order.destination?.region},{" "}
                            {order.destination?.city},{" "}
                            {order.destination?.street}, д.{" "}
                            {order.destination?.house}
                            {order.destination?.apartment &&
                              `, кв. ${order.destination.apartment}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Package className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Грузы</p>
                          <p className="text-sm text-muted-foreground">
                            Всего: {order.cargos.length} шт. •{" "}
                            {order.cargos.reduce(
                              (sum, c) => sum + c.weightKg,
                              0,
                            )}{" "}
                            кг
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {order.cargos.map((cargo) => (
                        <div
                          key={cargo.id}
                          className="rounded-md bg-muted/50 p-3 text-sm"
                        >
                          <p className="font-medium">{cargo.name}</p>
                          <p className="text-muted-foreground text-xs mt-1">
                            {cargo.type?.name} • {cargo.weightKg} кг •{" "}
                            {cargo.lengthCm}×{cargo.widthCm}×{cargo.heightCm} см
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
