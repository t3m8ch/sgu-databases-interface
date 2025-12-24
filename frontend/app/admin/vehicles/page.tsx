"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Checkbox } from "@/components/ui/checkbox";
import type { Vehicle } from "@/lib/types";
import { Loader2, Plus, Car } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { brands, driverLicenseCategories, cargoTypes } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

export default function AdminVehiclesPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // Form state
  const [carNumber, setCarNumber] = useState("");
  const [brandId, setBrandId] = useState("");
  const [loadCapacityKg, setLoadCapacityKg] = useState("");
  const [lengthCm, setLengthCm] = useState("");
  const [widthCm, setWidthCm] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCargoTypes, setSelectedCargoTypes] = useState<string[]>([]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/login");
      return;
    }

    loadVehicles();
  }, [isAuthenticated, user, router]);

  const loadVehicles = () => {
    const allVehicles: Vehicle[] = JSON.parse(
      localStorage.getItem("vehicles") || "[]",
    );
    setVehicles(allVehicles);
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const vehicleId = `vehicle-${Date.now()}`;

    const selectedCats = driverLicenseCategories.filter((cat) =>
      selectedCategories.includes(cat.id),
    );
    const selectedCargo = cargoTypes.filter((ct) =>
      selectedCargoTypes.includes(ct.id),
    );
    const brand = brands.find((b) => b.id === brandId);

    const newVehicle: Vehicle = {
      id: vehicleId,
      carNumber,
      brandId,
      brand,
      loadCapacityKg: Number.parseInt(loadCapacityKg),
      lengthCm: Number.parseInt(lengthCm),
      widthCm: Number.parseInt(widthCm),
      heightCm: Number.parseInt(heightCm),
      allowableCategories: selectedCats,
      allowableCargoTypes: selectedCargo,
      inspections: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const allVehicles = JSON.parse(localStorage.getItem("vehicles") || "[]");
    allVehicles.push(newVehicle);
    localStorage.setItem("vehicles", JSON.stringify(allVehicles));

    toast({
      title: "Автомобиль добавлен",
      description: `Автомобиль ${carNumber} успешно добавлен`,
    });

    // Reset form
    setCarNumber("");
    setBrandId("");
    setLoadCapacityKg("");
    setLengthCm("");
    setWidthCm("");
    setHeightCm("");
    setSelectedCategories([]);
    setSelectedCargoTypes([]);

    setOpen(false);
    loadVehicles();
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
              <h1 className="text-3xl font-bold">Автомобили</h1>
              <p className="text-muted-foreground mt-1">
                Управление парком автомобилей
              </p>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить автомобиль
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Добавление автомобиля</DialogTitle>
                  <DialogDescription>
                    Заполните технические характеристики автомобиля
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Номер автомобиля *</Label>
                      <Input
                        value={carNumber}
                        onChange={(e) => setCarNumber(e.target.value)}
                        placeholder="А123ВС777"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Бренд *</Label>
                      <Select value={brandId} onValueChange={setBrandId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите бренд" />
                        </SelectTrigger>
                        <SelectContent>
                          {brands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Грузоподъемность (кг) *</Label>
                      <Input
                        type="number"
                        min="1"
                        value={loadCapacityKg}
                        onChange={(e) => setLoadCapacityKg(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Длина (см) *</Label>
                      <Input
                        type="number"
                        min="1"
                        value={lengthCm}
                        onChange={(e) => setLengthCm(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Ширина (см) *</Label>
                      <Input
                        type="number"
                        min="1"
                        value={widthCm}
                        onChange={(e) => setWidthCm(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Высота (см) *</Label>
                      <Input
                        type="number"
                        min="1"
                        value={heightCm}
                        onChange={(e) => setHeightCm(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Требуемые категории ВУ *</Label>
                    <div className="flex flex-wrap gap-4 p-4 border rounded-md">
                      {driverLicenseCategories.map((cat) => (
                        <div
                          key={cat.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`cat-${cat.id}`}
                            checked={selectedCategories.includes(cat.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedCategories([
                                  ...selectedCategories,
                                  cat.id,
                                ]);
                              } else {
                                setSelectedCategories(
                                  selectedCategories.filter(
                                    (id) => id !== cat.id,
                                  ),
                                );
                              }
                            }}
                          />
                          <label
                            htmlFor={`cat-${cat.id}`}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {cat.notation}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Типы грузов *</Label>
                    <div className="flex flex-col gap-2 p-4 border rounded-md max-h-48 overflow-y-auto">
                      {cargoTypes.map((ct) => (
                        <div
                          key={ct.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`cargo-${ct.id}`}
                            checked={selectedCargoTypes.includes(ct.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedCargoTypes([
                                  ...selectedCargoTypes,
                                  ct.id,
                                ]);
                              } else {
                                setSelectedCargoTypes(
                                  selectedCargoTypes.filter(
                                    (id) => id !== ct.id,
                                  ),
                                );
                              }
                            }}
                          />
                          <label
                            htmlFor={`cargo-${ct.id}`}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {ct.name}
                          </label>
                        </div>
                      ))}
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
                    <Button type="submit">Добавить автомобиль</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {vehicles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-muted p-6 mb-4">
                  <Car className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Нет автомобилей</h3>
                <p className="text-muted-foreground">
                  Добавьте первый автомобиль в парк
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((vehicle) => (
                <Card key={vehicle.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {vehicle.carNumber}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {vehicle.brand?.name}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">Характеристики</p>
                      <div className="rounded-md bg-muted/50 p-3 space-y-1 text-sm">
                        <p>Грузоподъемность: {vehicle.loadCapacityKg} кг</p>
                        <p>
                          Размеры: {vehicle.lengthCm}×{vehicle.widthCm}×
                          {vehicle.heightCm} см
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">
                        Требуемые категории
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {vehicle.allowableCategories.map((cat) => (
                          <Badge
                            key={cat.id}
                            variant="outline"
                            className="text-xs"
                          >
                            {cat.notation}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Типы грузов</p>
                      <div className="flex flex-wrap gap-1">
                        {vehicle.allowableCargoTypes.slice(0, 3).map((ct) => (
                          <Badge
                            key={ct.id}
                            variant="secondary"
                            className="text-xs"
                          >
                            {ct.name}
                          </Badge>
                        ))}
                        {vehicle.allowableCargoTypes.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{vehicle.allowableCargoTypes.length - 3}
                          </Badge>
                        )}
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
