export const serverEnv = {
  PgPort: parseInt(import.meta.env.POSTGRES_PORT),
  PgHost: import.meta.env.POSTGRES_HOST,
  PgUser: import.meta.env.POSTGRES_USER,
  PgDatabase: import.meta.env.POSTGRES_DB,
  PgPassword: import.meta.env.POSTGRES_PASSWORD,
  PgSSL: import.meta.env.POSTGRES_SSL === "true",
  PgDatabaseUrl: import.meta.env.DATABASE_URL,
  PasswordPepper: import.meta.env.PASSWORD_PEPPER ?? "",
  PasswordRounds: parseInt(import.meta.env.PASSWORD_ROUNDS ?? "1"),
  Mode: import.meta.env.MODE as "production" | "development",
};
