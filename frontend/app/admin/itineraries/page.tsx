"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Itinerary, Driver, Vehicle, Order } from "@/lib/types";
import { Loader2, Plus, Route, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

export default function AdminItinerariesPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // Available data
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);

  // Form state
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/login");
      return;
    }

    loadData();
  }, [isAuthenticated, user, router]);

  const loadData = () => {
    // Load itineraries
    const allItineraries: Itinerary[] = JSON.parse(
      localStorage.getItem("itineraries") || "[]",
    );
    setItineraries(allItineraries);

    // Load drivers
    const allDrivers: Driver[] = JSON.parse(
      localStorage.getItem("drivers") || "[]",
    );
    setDrivers(allDrivers);

    // Load vehicles
    const allVehicles: Vehicle[] = JSON.parse(
      localStorage.getItem("vehicles") || "[]",
    );
    setVehicles(allVehicles);

    // Load pending orders (not assigned to any itinerary)
    const allOrders: Order[] = JSON.parse(
      localStorage.getItem("orders") || "[]",
    );
    const pending = allOrders.filter(
      (order) => order.status === "pending" && !order.itineraryId,
    );
    setPendingOrders(pending);

    setLoading(false);
  };

  const canDriverOperateVehicle = (
    driverId: string,
    vehicleId: string,
  ): boolean => {
    const driver = drivers.find((d) => d.id === driverId);
    const vehicle = vehicles.find((v) => v.id === vehicleId);

    if (!driver || !vehicle) return false;

    // Check if driver has valid licenses with required categories
    const validLicenses = driver.licenses.filter(
      (l) => l.status === "valid" && new Date(l.expiredAt) > new Date(),
    );

    const driverCategories = validLicenses.flatMap((l) =>
      l.categories.map((c) => c.id),
    );
    const requiredCategories = vehicle.allowableCategories.map((c) => c.id);

    return requiredCategories.some((rc) => driverCategories.includes(rc));
  };

  const canVehicleCarryOrders = (
    vehicleId: string,
    orderIds: string[],
  ): boolean => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) return false;

    const orders = pendingOrders.filter((o) => orderIds.includes(o.id));

    // Check total weight
    const totalWeight = orders.reduce(
      (sum, order) => sum + order.cargos.reduce((s, c) => s + c.weightKg, 0),
      0,
    );
    if (totalWeight > vehicle.loadCapacityKg) return false;

    // Check cargo types
    const vehicleCargoTypeIds = vehicle.allowableCargoTypes.map((ct) => ct.id);
    const orderCargoTypeIds = orders.flatMap((o) =>
      o.cargos.map((c) => c.typeId),
    );

    return orderCargoTypeIds.every((ctId) =>
      vehicleCargoTypeIds.includes(ctId),
    );
  };

  const addOrderToItinerary = (orderId: string) => {
    if (!selectedOrderIds.includes(orderId)) {
      setSelectedOrderIds([...selectedOrderIds, orderId]);
    }
  };

  const removeOrderFromItinerary = (orderId: string) => {
    setSelectedOrderIds(selectedOrderIds.filter((id) => id !== orderId));
  };

  const moveOrderUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...selectedOrderIds];
    [newOrder[index - 1], newOrder[index]] = [
      newOrder[index],
      newOrder[index - 1],
    ];
    setSelectedOrderIds(newOrder);
  };

  const moveOrderDown = (index: number) => {
    if (index === selectedOrderIds.length - 1) return;
    const newOrder = [...selectedOrderIds];
    [newOrder[index], newOrder[index + 1]] = [
      newOrder[index + 1],
      newOrder[index],
    ];
    setSelectedOrderIds(newOrder);
  };

  const getVehicleAverageGrade = (vehicleId: string): number => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (!vehicle || vehicle.inspections.length === 0) return 0;

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const recentInspections = vehicle.inspections.filter(
      (i) => new Date(i.passedAt) > oneMonthAgo,
    );

    if (recentInspections.length === 0) return 0;

    const avgGrade =
      recentInspections.reduce((sum, i) => sum + i.grade, 0) /
      recentInspections.length;
    return Math.round(avgGrade * 10) / 10;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (
      !selectedDriverId ||
      !selectedVehicleId ||
      selectedOrderIds.length === 0
    ) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля и добавьте хотя бы один заказ",
        variant: "destructive",
      });
      return;
    }

    // Check compatibility
    if (!canDriverOperateVehicle(selectedDriverId, selectedVehicleId)) {
      toast({
        title: "Ошибка",
        description:
          "Водитель не имеет необходимых категорий для управления выбранным автомобилем",
        variant: "destructive",
      });
      return;
    }

    if (!canVehicleCarryOrders(selectedVehicleId, selectedOrderIds)) {
      toast({
        title: "Ошибка",
        description:
          "Автомобиль не может перевезти выбранные грузы (превышена грузоподъемность или несовместимые типы)",
        variant: "destructive",
      });
      return;
    }

    const itineraryId = `itinerary-${Date.now()}`;

    const driver = drivers.find((d) => d.id === selectedDriverId);
    const vehicle = vehicles.find((v) => v.id === selectedVehicleId);
    const orders = pendingOrders.filter((o) => selectedOrderIds.includes(o.id));

    const newItinerary: Itinerary = {
      id: itineraryId,
      driverId: selectedDriverId,
      vehicleId: selectedVehicleId,
      driver,
      vehicle,
      orders,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save itinerary
    const allItineraries = JSON.parse(
      localStorage.getItem("itineraries") || "[]",
    );
    allItineraries.push(newItinerary);
    localStorage.setItem("itineraries", JSON.stringify(allItineraries));

    // Update orders
    const allOrders: Order[] = JSON.parse(
      localStorage.getItem("orders") || "[]",
    );
    const updatedOrders = allOrders.map((order) => {
      if (selectedOrderIds.includes(order.id)) {
        return {
          ...order,
          itineraryId,
          status: "in_transit" as const,
        };
      }
      return order;
    });
    localStorage.setItem("orders", JSON.stringify(updatedOrders));

    toast({
      title: "Маршрутный лист создан",
      description: `Маршрутный лист №${itineraryId.slice(-6)} успешно создан с ${selectedOrderIds.length} заказами`,
    });

    // Reset form
    setSelectedDriverId("");
    setSelectedVehicleId("");
    setSelectedOrderIds([]);

    setOpen(false);
    loadData();
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Маршрутные листы</h1>
              <p className="text-muted-foreground mt-1">
                Управление маршрутами доставки
              </p>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  disabled={
                    pendingOrders.length === 0 ||
                    drivers.length === 0 ||
                    vehicles.length === 0
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Создать маршрут
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Создание маршрутного листа</DialogTitle>
                  <DialogDescription>
                    Назначьте водителя, автомобиль и добавьте заказы
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Водитель *</Label>
                      <Select
                        value={selectedDriverId}
                        onValueChange={setSelectedDriverId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите водителя" />
                        </SelectTrigger>
                        <SelectContent>
                          {drivers.map((driver) => (
                            <SelectItem key={driver.id} value={driver.id}>
                              {driver.user.lastName} {driver.user.firstName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Автомобиль *</Label>
                      <Select
                        value={selectedVehicleId}
                        onValueChange={setSelectedVehicleId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите автомобиль" />
                        </SelectTrigger>
                        <SelectContent>
                          {vehicles.map((vehicle) => {
                            const avgGrade = getVehicleAverageGrade(vehicle.id);
                            const canOperate = selectedDriverId
                              ? canDriverOperateVehicle(
                                  selectedDriverId,
                                  vehicle.id,
                                )
                              : true;
                            return (
                              <SelectItem
                                key={vehicle.id}
                                value={vehicle.id}
                                disabled={!canOperate}
                              >
                                {vehicle.carNumber} • {vehicle.brand?.name}
                                {avgGrade > 0 && ` • ⭐ ${avgGrade}`}
                                {!canOperate && " (несовместимо)"}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      {selectedVehicleId && (
                        <p className="text-xs text-muted-foreground">
                          Средняя оценка за месяц:{" "}
                          {getVehicleAverageGrade(selectedVehicleId) ||
                            "Нет данных"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Заказы в маршруте</Label>
                      <Badge variant="secondary">
                        {selectedOrderIds.length} заказов
                      </Badge>
                    </div>

                    {selectedOrderIds.length > 0 && (
                      <div className="space-y-2 border rounded-md p-4">
                        {selectedOrderIds.map((orderId, index) => {
                          const order = pendingOrders.find(
                            (o) => o.id === orderId,
                          );
                          if (!order) return null;

                          return (
                            <div
                              key={orderId}
                              className="flex items-center gap-2 p-3 bg-muted/50 rounded-md"
                            >
                              <div className="flex flex-col gap-1 mr-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => moveOrderUp(index)}
                                  disabled={index === 0}
                                >
                                  <ArrowUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => moveOrderDown(index)}
                                  disabled={
                                    index === selectedOrderIds.length - 1
                                  }
                                >
                                  <ArrowDown className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">
                                  #{index + 1} • Заказ №{order.id.slice(-6)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {order.destination?.city},{" "}
                                  {order.destination?.street} •{" "}
                                  {order.cargos.length} грузов
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  removeOrderFromItinerary(orderId)
                                }
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Доступные заказы</Label>
                      <div className="max-h-64 overflow-y-auto space-y-2 border rounded-md p-4">
                        {pendingOrders
                          .filter(
                            (order) => !selectedOrderIds.includes(order.id),
                          )
                          .map((order) => {
                            const canCarry = selectedVehicleId
                              ? canVehicleCarryOrders(selectedVehicleId, [
                                  ...selectedOrderIds,
                                  order.id,
                                ])
                              : true;

                            return (
                              <div
                                key={order.id}
                                className="flex items-center justify-between p-3 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex-1">
                                  <p className="text-sm font-medium">
                                    Заказ №{order.id.slice(-6)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {order.destination?.city},{" "}
                                    {order.destination?.street} •{" "}
                                    {order.cargos.length} грузов •{" "}
                                    {order.cargos.reduce(
                                      (sum, c) => sum + c.weightKg,
                                      0,
                                    )}{" "}
                                    кг
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => addOrderToItinerary(order.id)}
                                  disabled={!canCarry}
                                >
                                  {canCarry ? "Добавить" : "Несовместимо"}
                                </Button>
                              </div>
                            );
                          })}

                        {pendingOrders.filter(
                          (order) => !selectedOrderIds.includes(order.id),
                        ).length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Все заказы добавлены
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpen(false)}
                    >
                      Отмена
                    </Button>
                    <Button type="submit">Создать маршрут</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {pendingOrders.length === 0 && itineraries.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-muted p-6 mb-4">
                  <Route className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Нет заказов для маршрутов
                </h3>
                <p className="text-muted-foreground">
                  Маршруты появятся здесь после создания заказов клиентами
                </p>
              </CardContent>
            </Card>
          )}

          {pendingOrders.length > 0 &&
            (drivers.length === 0 || vehicles.length === 0) && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="rounded-full bg-muted p-6 mb-4">
                    <Route className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    Недостаточно данных
                  </h3>
                  <p className="text-muted-foreground">
                    Добавьте водителей и автомобили для создания маршрутных
                    листов
                  </p>
                </CardContent>
              </Card>
            )}

          {itineraries.length > 0 && (
            <div className="space-y-4">
              {itineraries.map((itinerary) => (
                <Card key={itinerary.id}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg">
                          Маршрут №{itinerary.id.slice(-6)}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Создан{" "}
                          {new Date(itinerary.createdAt).toLocaleString(
                            "ru-RU",
                          )}
                        </p>
                      </div>
                      <Badge>Активен</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium mb-1">Водитель</p>
                        <div className="rounded-md bg-muted/50 p-3">
                          <p className="text-sm">
                            {itinerary.driver?.user.lastName}{" "}
                            {itinerary.driver?.user.firstName}{" "}
                            {itinerary.driver?.user.patronymic}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Автомобиль</p>
                        <div className="rounded-md bg-muted/50 p-3">
                          <p className="text-sm">
                            {itinerary.vehicle?.carNumber} •{" "}
                            {itinerary.vehicle?.brand?.name}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">
                        Заказы ({itinerary.orders.length})
                      </p>
                      <div className="space-y-2">
                        {itinerary.orders.map((order, index) => (
                          <div
                            key={order.id}
                            className="rounded-md bg-muted/50 p-3"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-sm font-medium">
                                  #{index + 1} • Заказ №{order.id.slice(-6)}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {order.destination?.region},{" "}
                                  {order.destination?.city},{" "}
                                  {order.destination?.street}, д.{" "}
                                  {order.destination?.house}
                                </p>
                              </div>
                              <Badge variant="outline">
                                {order.cargos.length} грузов
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
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
