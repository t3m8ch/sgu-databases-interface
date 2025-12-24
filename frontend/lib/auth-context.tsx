"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User, Client, CustomerDetails } from "./types"
import { adminUser } from "./mock-data"

interface AuthContextType {
  user: User | null
  client: Client | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  register: (userData: RegisterData) => Promise<boolean>
  isAuthenticated: boolean
}

interface RegisterData {
  username: string
  firstName: string
  lastName: string
  patronymic?: string
  birthday: string
  password: string
  customerDetails: Omit<CustomerDetails, "clientId" | "createdAt" | "updatedAt">
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [client, setClient] = useState<Client | null>(null)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("currentUser")
    const storedClient = localStorage.getItem("currentClient")

    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    if (storedClient) {
      setClient(JSON.parse(storedClient))
    }
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    // Check admin
    if (username === "admin" && password === "admin") {
      setUser(adminUser)
      localStorage.setItem("currentUser", JSON.stringify(adminUser))
      return true
    }

    // Check clients
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const foundUser = users.find((u: User) => u.username === username)

    if (foundUser && password === "password") {
      setUser(foundUser)
      localStorage.setItem("currentUser", JSON.stringify(foundUser))

      // Get client data
      const clients = JSON.parse(localStorage.getItem("clients") || "[]")
      const foundClient = clients.find((c: Client) => c.userId === foundUser.id)

      if (foundClient) {
        setClient(foundClient)
        localStorage.setItem("currentClient", JSON.stringify(foundClient))
      }

      return true
    }

    return false
  }

  const logout = () => {
    setUser(null)
    setClient(null)
    localStorage.removeItem("currentUser")
    localStorage.removeItem("currentClient")
  }

  const register = async (userData: RegisterData): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem("users") || "[]")

    // Check if username already exists
    if (users.some((u: User) => u.username === userData.username)) {
      return false
    }

    const userId = `user-${Date.now()}`
    const clientId = `client-${Date.now()}`

    const newUser: User = {
      id: userId,
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
      patronymic: userData.patronymic,
      birthday: userData.birthday,
      role: "client",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const newCustomerDetails: CustomerDetails = {
      ...userData.customerDetails,
      clientId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const newClient: Client = {
      id: clientId,
      userId,
      user: newUser,
      customerDetails: newCustomerDetails,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    users.push(newUser)
    localStorage.setItem("users", JSON.stringify(users))

    const clients = JSON.parse(localStorage.getItem("clients") || "[]")
    clients.push(newClient)
    localStorage.setItem("clients", JSON.stringify(clients))

    setUser(newUser)
    setClient(newClient)
    localStorage.setItem("currentUser", JSON.stringify(newUser))
    localStorage.setItem("currentClient", JSON.stringify(newClient))

    return true
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        client,
        login,
        logout,
        register,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
