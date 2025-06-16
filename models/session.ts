import crypto from "crypto";
import database from "~/infra/database";

export type PublicSession = {
  id: string;
  token: string;
  user_id: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
};

const EXPIRATION_DATE_IN_SECONDS = 60 * 60 * 24 * 30;

async function create(userId: string) {
  const token = crypto.randomBytes(48).toString("hex");
  const date = addExpirationDate(new Date());
  const sessionRow = await database.sql`
    INSERT INTO sessions (token, user_id, expires_at)
    VALUES (${token}, ${userId}, ${date})
    RETURNING *;
  `;
  return sessionRow.rows[0] as PublicSession;
}

function addExpirationDate(date: Date) {
  date.setSeconds(date.getSeconds() + EXPIRATION_DATE_IN_SECONDS);
  return date;
}

export default { create, addExpirationDate, EXPIRATION_DATE_IN_SECONDS };
