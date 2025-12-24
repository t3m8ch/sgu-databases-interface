// Mock data for the application
import type { User, DriverLicenseCategory, Brand, CargoType } from "./types"

// Driver License Categories
export const driverLicenseCategories: DriverLicenseCategory[] = [
  {
    id: "1",
    notation: "B",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    notation: "C",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    notation: "CE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    notation: "D",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// Cargo Types
export const cargoTypes: CargoType[] = [
  {
    id: "1",
    name: "Продукты питания",
    description: "Скоропортящиеся продукты питания",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Мебель",
    description: "Домашняя и офисная мебель",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Электроника",
    description: "Бытовая и офисная электроника",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Стройматериалы",
    description: "Строительные материалы",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// Brands
export const brands: Brand[] = [
  { id: "1", name: "КАМАЗ", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "2", name: "МАЗ", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "3", name: "Volvo", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "4", name: "Mercedes-Benz", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
]

// Admin user
export const adminUser: User = {
  id: "admin-1",
  username: "admin",
  firstName: "Администратор",
  lastName: "Системы",
  role: "admin",
  birthday: "1990-01-01",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
