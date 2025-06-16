import migrator from "~/models/migrator";
import user from "~/models/user";
import database from "./database";
import { faker } from "@faker-js/faker";

async function retry<T>(fn: () => Promise<T>, maxRetries = 30) {
  try {
    process.stdout.write(".");
    await new Promise((res) => setTimeout(res, 200));
    await fn();
  } catch {
    if (maxRetries <= 0) throw new Error("Max retries exceeded!");
    return retry(fn, maxRetries - 1);
  }
}

async function waitForWebServer() {
  process.stdout.write("\n🟨 Waiting for webserver");
  async function checkWebServer() {
    const response = await fetch("http://localhost:3000/api/v1/status");
    if (!response.ok) throw new Error();
  }
  await retry(checkWebServer);
  process.stdout.write("\n\n");
}

async function clearDatabase() {
  await database.sql`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`;
}

async function runPendingMigrations() {
  await migrator.runPendingMigrations();
}

async function createUser(newUser?: {
  username?: string;
  email?: string;
  password?: string;
}) {
  if (!newUser) newUser = {};
  return user.create({
    username:
      newUser.username ?? faker.internet.username().replace(/[_.-]/g, ""),
    email: newUser.email ?? faker.internet.email(),
    password: newUser.password ?? "validpassword",
  });
}

export default {
  waitForWebServer,
  clearDatabase,
  runPendingMigrations,
  createUser,
};
