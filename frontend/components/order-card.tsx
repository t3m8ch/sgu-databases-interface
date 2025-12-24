"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Order } from "@/lib/types"
import { Package, MapPin, Clock, Truck } from "lucide-react"

interface OrderCardProps {
  order: Order
}

const statusMap = {
  pending: { label: "Ожидает назначения", variant: "secondary" as const },
  in_transit: { label: "В пути", variant: "default" as const },
  delivered: { label: "Доставлен", variant: "outline" as const },
}

export function OrderCard({ order }: OrderCardProps) {
  const status = statusMap[order.status]
  const destination = order.destination

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">Заказ №{order.id.slice(-6)}</CardTitle>
            <CardDescription>Создан {new Date(order.createdAt).toLocaleDateString("ru-RU")}</CardDescription>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Destination */}
        <div className="flex gap-3">
          <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Адрес доставки</p>
            <p className="text-sm text-muted-foreground">
              {destination?.region}, {destination?.city}, {destination?.street}, д. {destination?.house}
              {destination?.apartment && `, кв. ${destination.apartment}`}
            </p>
          </div>
        </div>

        {/* Delivery date */}
        <div className="flex gap-3">
          <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Дата доставки</p>
            <p className="text-sm text-muted-foreground">
              {new Date(order.deliveredAt).toLocaleString("ru-RU", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* Cargos */}
        <div className="flex gap-3">
          <Package className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <p className="text-sm font-medium">Грузы ({order.cargos.length})</p>
            <div className="space-y-2">
              {order.cargos.map((cargo) => (
                <div key={cargo.id} className="rounded-md bg-muted/50 p-3 text-sm">
                  <p className="font-medium">{cargo.name}</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    {cargo.type?.name} • {cargo.weightKg} кг • {cargo.lengthCm}×{cargo.widthCm}×{cargo.heightCm} см
                  </p>
                  {cargo.description && <p className="text-muted-foreground text-xs mt-1">{cargo.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Itinerary status */}
        {order.itineraryId && (
          <div className="flex gap-3">
            <Truck className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Маршрутный лист</p>
              <p className="text-sm text-muted-foreground">№{order.itineraryId.slice(-6)}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
