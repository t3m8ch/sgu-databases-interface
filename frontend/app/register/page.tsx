"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Truck } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  // Step 1: Personal data
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [patronymic, setPatronymic] = useState("");
  const [birthday, setBirthday] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 2: Customer details
  const [accountNumber, setAccountNumber] = useState("");
  const [inn, setInn] = useState("");
  const [bik, setBik] = useState("");
  const [correspondentAccount, setCorrespondentAccount] = useState("");
  const [kpp, setKpp] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAddress, setBankAddress] = useState("");

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    if (password.length < 4) {
      setError("Пароль должен содержать минимум 4 символа");
      return;
    }

    setStep(2);
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const success = await register({
      username,
      firstName,
      lastName,
      patronymic: patronymic || undefined,
      birthday,
      password,
      customerDetails: {
        accountNumber,
        inn,
        bik,
        correspondentAccount,
        kpp,
        bankName,
        bankAddress,
      },
    });

    if (success) {
      router.push("/client");
    } else {
      setError("Пользователь с таким именем уже существует");
      setStep(1);
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-2">
          <div className="flex justify-center mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <Truck className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">
            Регистрация клиента
          </CardTitle>
          <CardDescription className="text-center">
            {step === 1 ? "Шаг 1: Личные данные" : "Шаг 2: Реквизиты"}
          </CardDescription>
        </CardHeader>

        {step === 1 ? (
          <form onSubmit={handleStep1Submit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="username">Имя пользователя *</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthday">Дата рождения *</Label>
                  <Input
                    id="birthday"
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="lastName">Фамилия *</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstName">Имя *</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="patronymic">Отчество</Label>
                <Input
                  id="patronymic"
                  value={patronymic}
                  onChange={(e) => setPatronymic(e.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password">Пароль *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    Подтверждение пароля *
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>

            <div className="flex flex-col gap-3 p-6 pt-0">
              <Button type="submit" className="w-full mt-4">
                Далее
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Уже есть аккаунт?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Войти
                </Link>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleStep2Submit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="inn">ИНН *</Label>
                  <Input
                    id="inn"
                    value={inn}
                    onChange={(e) => setInn(e.target.value)}
                    placeholder="1234567890"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kpp">КПП *</Label>
                  <Input
                    id="kpp"
                    value={kpp}
                    onChange={(e) => setKpp(e.target.value)}
                    placeholder="123456789"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Номер счёта *</Label>
                  <Input
                    id="accountNumber"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="40702810000000000000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bik">БИК *</Label>
                  <Input
                    id="bik"
                    value={bik}
                    onChange={(e) => setBik(e.target.value)}
                    placeholder="044525225"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="correspondentAccount">
                  Корреспондентский счёт *
                </Label>
                <Input
                  id="correspondentAccount"
                  value={correspondentAccount}
                  onChange={(e) => setCorrespondentAccount(e.target.value)}
                  placeholder="30101810000000000000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankName">Название банка *</Label>
                <Input
                  id="bankName"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="ПАО Сбербанк"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankAddress">Адрес банка *</Label>
                <Input
                  id="bankAddress"
                  value={bankAddress}
                  onChange={(e) => setBankAddress(e.target.value)}
                  placeholder="г. Москва, ул. Ленина, д. 1"
                  required
                />
              </div>
            </CardContent>

            <div className="flex flex-col gap-3 p-6 pt-0 mt-4">
              <Button
                type="button"
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => setStep(1)}
              >
                Назад
              </Button>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Регистрация..." : "Зарегистрироваться"}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
