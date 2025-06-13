import database from "~/infra/database";

type CreateUserDTO = {
  username: string;
  email: string;
  password: string;
};

async function create(userData: CreateUserDTO) {
  const rows = await database.sql`
    INSERT INTO users (username, email, password)
    VALUES (${userData.username}, ${userData.email}, ${userData.password})
    RETURNING *;
  `;
  return rows.rows[0];
}

export default { create };
