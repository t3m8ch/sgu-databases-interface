"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { CargoType } from "@/lib/types";
import { Loader2, Plus, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cargoTypes as initialCargoTypes } from "@/lib/mock-data";

export default function AdminCargoTypesPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [cargoTypes, setCargoTypes] = useState<CargoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/login");
      return;
    }

    loadCargoTypes();
  }, [isAuthenticated, user, router]);

  const loadCargoTypes = () => {
    const stored = localStorage.getItem("cargoTypes");
    if (!stored) {
      // Initialize with default cargo types
      localStorage.setItem("cargoTypes", JSON.stringify(initialCargoTypes));
      setCargoTypes(initialCargoTypes);
    } else {
      setCargoTypes(JSON.parse(stored));
    }
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newCargoType: CargoType = {
      id: `cargo-type-${Date.now()}`,
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [...cargoTypes, newCargoType];
    localStorage.setItem("cargoTypes", JSON.stringify(updated));
    setCargoTypes(updated);

    toast({
      title: "Тип груза добавлен",
      description: `Тип груза "${name}" успешно добавлен`,
    });

    setName("");
    setDescription("");
    setOpen(false);
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
              <h1 className="text-3xl font-bold">Типы грузов</h1>
              <p className="text-muted-foreground mt-1">
                Управление категориями грузов
              </p>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить тип
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Добавление типа груза</DialogTitle>
                  <DialogDescription>
                    Создайте новую категорию груза
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Название *</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Описание *</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpen(false)}
                    >
                      Отмена
                    </Button>
                    <Button type="submit">Добавить</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cargoTypes.map((cargoType) => (
              <Card key={cargoType.id}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    {cargoType.name}
                  </CardTitle>
                  <CardDescription>{cargoType.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
