"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ClientLayout } from "@/components/client-layout";
import { CreateOrderDialog } from "@/components/create-order-dialog";
import { OrderCard } from "@/components/order-card";
import type { Order } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function ClientDashboard() {
  const { user, client, isAuthenticated } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user?.role !== "client") {
      router.push("/admin");
      return;
    }

    loadOrders();
  }, [isAuthenticated, user, router]);

  const loadOrders = () => {
    setLoading(true);
    const allOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    const clientOrders = allOrders.filter(
      (order: Order) => order.clientId === client?.id,
    );
    setOrders(clientOrders);
    setLoading(false);
  };

  if (!isAuthenticated || !client) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <ClientLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Мои заказы</h1>
              <p className="text-muted-foreground mt-1">
                Управляйте своими заказами на доставку
              </p>
            </div>
            <CreateOrderDialog
              clientId={client.id}
              onOrderCreated={loadOrders}
            />
          </div>

          {/* Orders list */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <svg
                  className="h-12 w-12 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Нет заказов</h3>
              <p className="text-muted-foreground mb-6">
                Создайте свой первый заказ на доставку
              </p>
              <CreateOrderDialog
                clientId={client.id}
                onOrderCreated={loadOrders}
              />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  );
}
