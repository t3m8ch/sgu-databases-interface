from dataclasses import dataclass
from datetime import date
from typing import Literal
from uuid import UUID


@dataclass
class LoginDTO:
    username: str
    password: str


@dataclass
class ClientDetailsDTO:
    inn: str
    kpp: str
    account_number: str
    bik: str
    correspondent_account: str
    bank_name: str
    bank_address: str


@dataclass
class RegisterDTO:
    username: str
    first_name: str
    last_name: str
    patronymic: str | None
    password: str
    birthday: date
    details: ClientDetailsDTO


@dataclass
class SessionDTO:
    user_id: UUID
    role: Literal["admin", "client", "guest"]
