import { fileURLToPath } from "url";
import path, { dirname } from "path";

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

export const pathEnv = {
  filename: fileURLToPath(import.meta.url),
  dirname: dirname(__filename),
  migrations:
    import.meta.env.VERCEL === "1"
      ? path.resolve(__dirname, "infra", "migrations")
      : path.resolve(__dirname, "..", "..", "infra", "migrations"),
};
