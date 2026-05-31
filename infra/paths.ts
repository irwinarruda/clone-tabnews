import { join } from "path";

export function migrationsDir(): string {
  return join(process.cwd(), "infra", "migrations");
}
