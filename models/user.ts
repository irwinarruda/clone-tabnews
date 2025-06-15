import database from "~/infra/database";
import { NotFoundError, ValidationError } from "~/infra/errors";
import password from "~/models/password";

type CreateUserDTO = {
  username: string;
  email: string;
  password: string;
};

async function create(userData: CreateUserDTO) {
  await ensureUniqueEmail(userData.email);
  await ensureUniqueUsername(userData.username);
  userData.password = await password.generateHash(userData.password);
  const userRows = await database.sql`
    INSERT INTO users (username, email, password)
    VALUES (${userData.username}, ${userData.email}, ${userData.password})
    RETURNING *;
  `;
  return userRows.rows[0];
}

type UpdateUserDTO = {
  username: string;
  email: string;
  password: string;
};

async function update(username: string | undefined, userData: UpdateUserDTO) {
  if (!username) {
    throw new ValidationError("Por favor envie um usuário válido");
  }
  const user = await findByUsername(username);
  if ("username" in userData) {
    const isDifferentUsername =
      user.username.toLowerCase() !== userData.username.toLowerCase();
    if (isDifferentUsername) await ensureUniqueUsername(userData.username);
  }
  if ("email" in userData) {
    await ensureUniqueEmail(userData.email);
  }
  if ("password" in userData) {
    userData.password = await password.generateHash(userData.password);
  }
  const currentUser = { ...user, ...userData };
  const userRows = await database.sql`
    UPDATE users SET
      username = ${currentUser.username},
      email = ${currentUser.email},
      password = ${currentUser.password},
      updated_at = timezone('utc', now())
    WHERE id = ${currentUser.id}
    RETURNING *;
  `;
  return userRows.rows[0];
}

async function findByUsername(username?: string) {
  if (!username) throw new ValidationError("Por favor envie um usuário válido");
  const userRows = await database.sql`
    SELECT * FROM users WHERE LOWER(username) = LOWER(${username}) LIMIT 1;
  `;
  if (!userRows.rowCount) {
    throw new NotFoundError(
      "O usuário informado não existe.",
      "Utilize outro nome de usuário para realizar a busca.",
    );
  }
  return userRows.rows[0];
}

async function ensureUniqueEmail(email: string) {
  const emailRows = await database.sql`
    SELECT email FROM users WHERE LOWER(email) = LOWER(${email});
  `;
  if (emailRows.rowCount && emailRows.rowCount > 0) {
    throw new ValidationError(
      "O email informado já está sendo utilizado.",
      "Utilize outro email para realizar esta operação.",
    );
  }
}

async function ensureUniqueUsername(username: string) {
  const usernameRows = await database.sql`
      SELECT username FROM users WHERE LOWER(username) = LOWER(${username});
    `;
  if (usernameRows.rowCount && usernameRows.rowCount > 0) {
    throw new ValidationError(
      "O usuário informado já está sendo utilizado.",
      "Utilize outro nome de usuário para realizar esta operação.",
    );
  }
}

export default { create, update, findByUsername };
