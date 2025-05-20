import database from "~/infra/database";

export default defineEventHandler(async (_) => {
  const result = await database.sql`SELECT 2 + 3 as sum;`;
  return {
    message: result.rows[0].sum,
  };
});
