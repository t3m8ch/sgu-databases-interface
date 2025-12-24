// Core types for the freight transportation system

export type UserRole = "client" | "admin"

export interface User {
  id: string
  username: string
  firstName: string
  lastName: string
  patronymic?: string
  birthday: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface UserCredentials {
  userId: string
  passwordHash: string
}

export interface CustomerDetails {
  clientId: string
  accountNumber: string
  bik: string
  correspondentAccount: string
  inn: string
  kpp: string
  bankName: string
  bankAddress: string
  createdAt: string
  updatedAt: string
}

export interface Client {
  id: string
  userId: string
  user: User
  customerDetails?: CustomerDetails
  createdAt: string
  updatedAt: string
}

export interface Driver {
  id: string
  userId: string
  user: User
  licenses: DriverLicense[]
  createdAt: string
  updatedAt: string
}

export type DriverLicenseStatus = "valid" | "invalid"

export interface DriverLicense {
  id: string
  series: string
  number: string
  issuedAt: string
  expiredAt: string
  status: DriverLicenseStatus
  driverId: string
  categories: DriverLicenseCategory[]
  createdAt: string
  updatedAt: string
}

export interface DriverLicenseCategory {
  id: string
  notation: string
  createdAt: string
  updatedAt: string
}

export interface Brand {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface Vehicle {
  id: string
  loadCapacityKg: number
  lengthCm: number
  widthCm: number
  heightCm: number
  carNumber: string
  brandId: string
  brand?: Brand
  allowableCategories: DriverLicenseCategory[]
  allowableCargoTypes: CargoType[]
  inspections: VehicleInspection[]
  createdAt: string
  updatedAt: string
}

export interface VehicleInspection {
  id: string
  passedAt: string
  grade: number
  description: string
  vehicleId: string
  createdAt: string
  updatedAt: string
}

export interface Destination {
  id: string
  region: string
  city: string
  street: string
  house: string
  apartment?: string
  createdAt: string
  updatedAt: string
}

export type OrderStatus = "pending" | "in_transit" | "delivered"

export interface Order {
  id: string
  deliveredAt: string
  itineraryId?: string
  clientId: string
  destinationId: string
  destination?: Destination
  cargos: Cargo[]
  status: OrderStatus
  createdAt: string
  updatedAt: string
}

export interface Itinerary {
  id: string
  vehicleId: string
  driverId: string
  vehicle?: Vehicle
  driver?: Driver
  orders: Order[]
  createdAt: string
  updatedAt: string
}

export interface CargoType {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

export interface Cargo {
  id: string
  name: string
  description?: string
  weightKg: number
  lengthCm: number
  widthCm: number
  heightCm: number
  typeId: string
  type?: CargoType
  orderId: string
  createdAt: string
  updatedAt: string
}
