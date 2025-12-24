"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Brand } from "@/lib/types";
import { Loader2, Plus, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { brands as initialBrands } from "@/lib/mock-data";

export default function AdminBrandsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/login");
      return;
    }

    loadBrands();
  }, [isAuthenticated, user, router]);

  const loadBrands = () => {
    const stored = localStorage.getItem("brands");
    if (!stored) {
      localStorage.setItem("brands", JSON.stringify(initialBrands));
      setBrands(initialBrands);
    } else {
      setBrands(JSON.parse(stored));
    }
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newBrand: Brand = {
      id: `brand-${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [...brands, newBrand];
    localStorage.setItem("brands", JSON.stringify(updated));
    setBrands(updated);

    toast({
      title: "Бренд добавлен",
      description: `Бренд "${name}" успешно добавлен`,
    });

    setName("");
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
              <h1 className="text-3xl font-bold">Бренды автомобилей</h1>
              <p className="text-muted-foreground mt-1">
                Управление марками автомобилей
              </p>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить бренд
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Добавление бренда</DialogTitle>
                  <DialogDescription>
                    Создайте новый бренд автомобиля
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Название *</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Например: КАМАЗ"
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

          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {brands.map((brand) => (
              <Card key={brand.id}>
                <CardHeader className="p-6">
                  <CardTitle className="text-lg text-center flex flex-col items-center gap-2">
                    <Truck className="h-6 w-6 text-muted-foreground" />
                    {brand.name}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
