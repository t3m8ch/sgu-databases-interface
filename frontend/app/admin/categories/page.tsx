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
import type { DriverLicenseCategory } from "@/lib/types";
import { Loader2, Plus, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { driverLicenseCategories as initialCategories } from "@/lib/mock-data";

export default function AdminCategoriesPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [categories, setCategories] = useState<DriverLicenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const [notation, setNotation] = useState("");

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/login");
      return;
    }

    loadCategories();
  }, [isAuthenticated, user, router]);

  const loadCategories = () => {
    const stored = localStorage.getItem("driverLicenseCategories");
    if (!stored) {
      localStorage.setItem(
        "driverLicenseCategories",
        JSON.stringify(initialCategories),
      );
      setCategories(initialCategories);
    } else {
      setCategories(JSON.parse(stored));
    }
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newCategory: DriverLicenseCategory = {
      id: `category-${Date.now()}`,
      notation,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [...categories, newCategory];
    localStorage.setItem("driverLicenseCategories", JSON.stringify(updated));
    setCategories(updated);

    toast({
      title: "Категория добавлена",
      description: `Категория "${notation}" успешно добавлена`,
    });

    setNotation("");
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
              <h1 className="text-3xl font-bold">
                Категории водительских удостоверений
              </h1>
              <p className="text-muted-foreground mt-1">
                Управление категориями ВУ
              </p>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить категорию
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Добавление категории</DialogTitle>
                  <DialogDescription>
                    Создайте новую категорию водительского удостоверения
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Обозначение *</Label>
                    <Input
                      value={notation}
                      onChange={(e) => setNotation(e.target.value)}
                      placeholder="Например: A, B, C, CE"
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

          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {categories.map((category) => (
              <Card key={category.id}>
                <CardHeader className="p-6">
                  <CardTitle className="text-2xl text-center flex flex-col items-center gap-2">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                    {category.notation}
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
