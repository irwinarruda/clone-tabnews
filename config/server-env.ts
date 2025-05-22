export const serverEnv = {
  PgPort: parseInt(import.meta.env.POSTGRES_PORT),
  PgHost: import.meta.env.POSTGRES_HOST,
  PgUser: import.meta.env.POSTGRES_USER,
  PgDatabase: import.meta.env.POSTGRES_DB,
  PgPassword: import.meta.env.POSTGRES_PASSWORD,
  PgSSL: import.meta.env.POSTGRES_SSL === "true",
};
