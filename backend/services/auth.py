import uuid
from datetime import datetime

import asyncpg
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError

from dto.auth import LoginDTO, RegisterDTO, SessionDTO


class UserNotFoundError(Exception):
    pass


class InvalidPasswordError(Exception):
    pass


class AuthService:
    def __init__(
        self,
        conn: asyncpg.Connection,
        ph: PasswordHasher,
        admin_username: str,
        admin_password: str,
    ):
        self.conn = conn
        self.ph = ph
        self.admin_username = admin_username
        self.admin_password = admin_password

    async def login(self, login_dto: LoginDTO) -> SessionDTO:
        if (
            login_dto.username == self.admin_username
            and login_dto.password == self.admin_password
        ):
            return SessionDTO(user_id=uuid.uuid4(), role="admin")

        row = await self.conn.fetchrow(
            """
            select u.id,
                   uc.password_hash,
                   c.id is not null as is_client
            from users u
            join user_credentials uc on uc.user_id = u.id
            left join clients c on c.user_id = u.id
            where u.username = $1;""",
            login_dto.username,
        )

        if not row:
            raise UserNotFoundError()

        user_id, password_hash, is_client = row

        try:
            self.ph.verify(password_hash, login_dto.password)
            role = "client" if is_client else "guest"
            return SessionDTO(user_id=user_id, role=role)
        except VerifyMismatchError:
            raise InvalidPasswordError()
        except VerificationError:
            raise InvalidPasswordError()
        except InvalidHashError:
            raise InvalidPasswordError()

    async def register(self, register_dto: RegisterDTO) -> None:
        async with self.conn.transaction():
            user_id = uuid.uuid4()
            created_at = datetime.now()
            updated_at = created_at

            await self.conn.execute(
                """
                insert into users (
                    id, created_at, updated_at,
                    username, first_name, last_name,
                    patronymic, birthday
                ) values ($1, $2, $3, $4, $5, $6, $7, $8);""",
                user_id,
                created_at,
                updated_at,
                register_dto.username,
                register_dto.first_name,
                register_dto.last_name,
                register_dto.patronymic,
                register_dto.birthday,
            )

            client_id = uuid.uuid4()
            await self.conn.execute(
                """
                insert into clients (
                    id, created_at, updated_at, user_id
                ) values ($1, $2, $3, $4);""",
                client_id,
                created_at,
                updated_at,
                user_id,
            )

            await self.conn.execute(
                """
                insert into customer_details (
                    client_id, created_at, updated_at,
                    account_number, bik, correspondent_account,
                    inn, kpp, bank_name, bank_address
                ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);""",
                client_id,
                created_at,
                updated_at,
                register_dto.details.account_number,
                register_dto.details.bik,
                register_dto.details.correspondent_account,
                register_dto.details.inn,
                register_dto.details.kpp,
                register_dto.details.bank_name,
                register_dto.details.bank_address,
            )

            password_hash = self.ph.hash(register_dto.password)
            await self.conn.execute(
                """
                insert into user_credentials (
                    user_id, created_at, updated_at, password_hash
                ) values ($1, $2, $3, $4);""",
                user_id,
                created_at,
                updated_at,
                password_hash,
            )
