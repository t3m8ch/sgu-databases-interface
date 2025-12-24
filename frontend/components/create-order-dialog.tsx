"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"
import { cargoTypes } from "@/lib/mock-data"
import type { Order, Cargo, Destination } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface CreateOrderDialogProps {
  clientId: string
  onOrderCreated: () => void
}

interface CargoFormData {
  name: string
  description: string
  weightKg: string
  lengthCm: string
  widthCm: string
  heightCm: string
  typeId: string
}

export function CreateOrderDialog({ clientId, onOrderCreated }: CreateOrderDialogProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  // Destination fields
  const [region, setRegion] = useState("")
  const [city, setCity] = useState("")
  const [street, setStreet] = useState("")
  const [house, setHouse] = useState("")
  const [apartment, setApartment] = useState("")
  const [deliveredAt, setDeliveredAt] = useState("")

  // Cargo list
  const [cargos, setCargos] = useState<CargoFormData[]>([
    {
      name: "",
      description: "",
      weightKg: "",
      lengthCm: "",
      widthCm: "",
      heightCm: "",
      typeId: "",
    },
  ])

  const addCargo = () => {
    setCargos([
      ...cargos,
      {
        name: "",
        description: "",
        weightKg: "",
        lengthCm: "",
        widthCm: "",
        heightCm: "",
        typeId: "",
      },
    ])
  }

  const removeCargo = (index: number) => {
    setCargos(cargos.filter((_, i) => i !== index))
  }

  const updateCargo = (index: number, field: keyof CargoFormData, value: string) => {
    const newCargos = [...cargos]
    newCargos[index][field] = value
    setCargos(newCargos)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate cargos
    const isValid = cargos.every(
      (cargo) => cargo.name && cargo.typeId && cargo.weightKg && cargo.lengthCm && cargo.widthCm && cargo.heightCm,
    )

    if (!isValid) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля грузов",
        variant: "destructive",
      })
      return
    }

    const destinationId = `dest-${Date.now()}`
    const orderId = `order-${Date.now()}`

    const destination: Destination = {
      id: destinationId,
      region,
      city,
      street,
      house,
      apartment: apartment || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const cargoList: Cargo[] = cargos.map((cargo, index) => ({
      id: `cargo-${Date.now()}-${index}`,
      name: cargo.name,
      description: cargo.description || undefined,
      weightKg: Number.parseInt(cargo.weightKg),
      lengthCm: Number.parseInt(cargo.lengthCm),
      widthCm: Number.parseInt(cargo.widthCm),
      heightCm: Number.parseInt(cargo.heightCm),
      typeId: cargo.typeId,
      type: cargoTypes.find((ct) => ct.id === cargo.typeId),
      orderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))

    const newOrder: Order = {
      id: orderId,
      deliveredAt,
      clientId,
      destinationId,
      destination,
      cargos: cargoList,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Save to localStorage
    const orders = JSON.parse(localStorage.getItem("orders") || "[]")
    orders.push(newOrder)
    localStorage.setItem("orders", JSON.stringify(orders))

    toast({
      title: "Заказ создан",
      description: `Заказ №${orderId.slice(-6)} успешно создан`,
    })

    // Reset form
    setRegion("")
    setCity("")
    setStreet("")
    setHouse("")
    setApartment("")
    setDeliveredAt("")
    setCargos([
      {
        name: "",
        description: "",
        weightKg: "",
        lengthCm: "",
        widthCm: "",
        heightCm: "",
        typeId: "",
      },
    ])

    setOpen(false)
    onOrderCreated()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Создать заказ
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Создание нового заказа</DialogTitle>
          <DialogDescription>Заполните информацию о заказе и грузах для доставки</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Destination */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Адрес доставки</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="region">Регион *</Label>
                <Input id="region" value={region} onChange={(e) => setRegion(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Город *</Label>
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} required />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="street">Улица *</Label>
                <Input id="street" value={street} onChange={(e) => setStreet(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="house">Дом *</Label>
                <Input id="house" value={house} onChange={(e) => setHouse(e.target.value)} required />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="apartment">Квартира/Офис</Label>
                <Input id="apartment" value={apartment} onChange={(e) => setApartment(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveredAt">Желаемая дата доставки *</Label>
                <Input
                  id="deliveredAt"
                  type="datetime-local"
                  value={deliveredAt}
                  onChange={(e) => setDeliveredAt(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Cargos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Грузы</h3>
              <Button type="button" variant="outline" size="sm" onClick={addCargo}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить груз
              </Button>
            </div>

            {cargos.map((cargo, index) => (
              <div key={index} className="rounded-lg border p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Груз #{index + 1}</span>
                  {cargos.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeCargo(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Название *</Label>
                    <Input value={cargo.name} onChange={(e) => updateCargo(index, "name", e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Тип груза *</Label>
                    <Select value={cargo.typeId} onValueChange={(value) => updateCargo(index, "typeId", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип" />
                      </SelectTrigger>
                      <SelectContent>
                        {cargoTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Описание</Label>
                  <Textarea
                    value={cargo.description}
                    onChange={(e) => updateCargo(index, "description", e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                  <div className="space-y-2">
                    <Label>Вес (кг) *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={cargo.weightKg}
                      onChange={(e) => updateCargo(index, "weightKg", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Длина (см) *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={cargo.lengthCm}
                      onChange={(e) => updateCargo(index, "lengthCm", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ширина (см) *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={cargo.widthCm}
                      onChange={(e) => updateCargo(index, "widthCm", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Высота (см) *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={cargo.heightCm}
                      onChange={(e) => updateCargo(index, "heightCm", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit">Создать заказ</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
