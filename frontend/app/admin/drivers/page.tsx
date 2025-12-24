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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { Driver, User, DriverLicense } from "@/lib/types";
import { Loader2, Plus, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { driverLicenseCategories } from "@/lib/mock-data";

export default function AdminDriversPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [patronymic, setPatronymic] = useState("");
  const [birthday, setBirthday] = useState("");
  const [username, setUsername] = useState("");

  // License state
  const [series, setSeries] = useState("");
  const [number, setNumber] = useState("");
  const [issuedAt, setIssuedAt] = useState("");
  const [expiredAt, setExpiredAt] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/login");
      return;
    }

    loadDrivers();
  }, [isAuthenticated, user, router]);

  const loadDrivers = () => {
    const allDrivers: Driver[] = JSON.parse(
      localStorage.getItem("drivers") || "[]",
    );
    setDrivers(allDrivers);
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const userId = `user-${Date.now()}`;
    const driverId = `driver-${Date.now()}`;
    const licenseId = `license-${Date.now()}`;

    const newUser: User = {
      id: userId,
      username,
      firstName,
      lastName,
      patronymic: patronymic || undefined,
      birthday,
      role: "client",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const selectedCats = driverLicenseCategories.filter((cat) =>
      selectedCategories.includes(cat.id),
    );

    const newLicense: DriverLicense = {
      id: licenseId,
      series,
      number,
      issuedAt,
      expiredAt,
      status: new Date(expiredAt) > new Date() ? "valid" : "invalid",
      driverId,
      categories: selectedCats,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newDriver: Driver = {
      id: driverId,
      userId,
      user: newUser,
      licenses: [newLicense],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const allDrivers = JSON.parse(localStorage.getItem("drivers") || "[]");
    allDrivers.push(newDriver);
    localStorage.setItem("drivers", JSON.stringify(allDrivers));

    toast({
      title: "Водитель добавлен",
      description: `Водитель ${firstName} ${lastName} успешно добавлен`,
    });

    // Reset form
    setFirstName("");
    setLastName("");
    setPatronymic("");
    setBirthday("");
    setUsername("");
    setSeries("");
    setNumber("");
    setIssuedAt("");
    setExpiredAt("");
    setSelectedCategories([]);

    setOpen(false);
    loadDrivers();
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
              <h1 className="text-3xl font-bold">Водители</h1>
              <p className="text-muted-foreground mt-1">
                Управление водителями и водительскими удостоверениями
              </p>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить водителя
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Добавление водителя</DialogTitle>
                  <DialogDescription>
                    Заполните данные водителя и его водительского удостоверения
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold">Личные данные</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Фамилия *</Label>
                        <Input
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Имя *</Label>
                        <Input
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Отчество</Label>
                        <Input
                          value={patronymic}
                          onChange={(e) => setPatronymic(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Дата рождения *</Label>
                        <Input
                          type="date"
                          value={birthday}
                          onChange={(e) => setBirthday(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Имя пользователя *</Label>
                      <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold">
                      Водительское удостоверение
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Серия *</Label>
                        <Input
                          value={series}
                          onChange={(e) => setSeries(e.target.value)}
                          placeholder="1234"
                          maxLength={4}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Номер *</Label>
                        <Input
                          value={number}
                          onChange={(e) => setNumber(e.target.value)}
                          placeholder="567890"
                          maxLength={6}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Дата выдачи *</Label>
                        <Input
                          type="date"
                          value={issuedAt}
                          onChange={(e) => setIssuedAt(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Срок действия *</Label>
                        <Input
                          type="date"
                          value={expiredAt}
                          onChange={(e) => setExpiredAt(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Категории *</Label>
                      <div className="flex flex-wrap gap-4 p-4 border rounded-md">
                        {driverLicenseCategories.map((cat) => (
                          <div
                            key={cat.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={cat.id}
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
                              htmlFor={cat.id}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {cat.notation}
                            </label>
                          </div>
                        ))}
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
                    <Button type="submit">Добавить водителя</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {drivers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-muted p-6 mb-4">
                  <Users className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Нет водителей</h3>
                <p className="text-muted-foreground">
                  Добавьте первого водителя в систему
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {drivers.map((driver) => (
                <Card key={driver.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {driver.user.lastName} {driver.user.firstName}{" "}
                      {driver.user.patronymic}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      @{driver.user.username}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-2">
                        Водительское удостоверение
                      </p>
                      {driver.licenses.map((license) => (
                        <div
                          key={license.id}
                          className="rounded-md bg-muted/50 p-3 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm">
                              {license.series} {license.number}
                            </p>
                            <Badge
                              variant={
                                license.status === "valid"
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {license.status === "valid"
                                ? "Действует"
                                : "Недействительно"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            До{" "}
                            {new Date(license.expiredAt).toLocaleDateString(
                              "ru-RU",
                            )}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {license.categories.map((cat) => (
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
