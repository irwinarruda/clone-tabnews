import database from "~/infra/database";
import { ValidationError } from "~/infra/errors";

type CreateUserDTO = {
  username: string;
  email: string;
  password: string;
};

async function create(userData: CreateUserDTO) {
  // I could do LIMIT 1 here but want to only do that if needed
  const emailRows = await database.sql`
    SELECT email FROM users WHERE LOWER(email) = LOWER(${userData.email});
  `;
  if (emailRows.rowCount && emailRows.rowCount > 0) {
    throw new ValidationError(
      "O email informado já está sendo utilizado.",
      "Utilize outro email para realizar o cadastro.",
    );
  }
  const usernameRows = await database.sql`
    SELECT username FROM users WHERE LOWER(username) = LOWER(${userData.username});
  `;
  if (usernameRows.rowCount && usernameRows.rowCount > 0) {
    throw new ValidationError(
      "O usuário informado já está sendo utilizado.",
      "Utilize outro nome de usuário para realizar o cadastro.",
    );
  }
  const userRows = await database.sql`
    INSERT INTO users (username, email, password)
    VALUES (${userData.username}, ${userData.email}, ${userData.password})
    RETURNING *;
  `;
  return userRows.rows[0];
}

export default { create };
