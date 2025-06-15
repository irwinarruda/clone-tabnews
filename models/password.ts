import bcrypt from "bcryptjs";
import { serverEnv } from "~/config/server-env";

async function generateHash(password: string) {
  return bcrypt.hash(addPepper(password), serverEnv.PasswordRounds);
}

async function compareHash(originalPassword: string, hashPassword: string) {
  return bcrypt.compare(addPepper(originalPassword), hashPassword);
}

function addPepper(password: string) {
  return password + serverEnv.PasswordPepper;
}

export default { generateHash, compareHash };
