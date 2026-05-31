import crypto from "crypto";
import database from "~/infra/database";
import { NotFoundError } from "~/infra/errors";

export type PublicSession = {
  id: string;
  token: string;
  user_id: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
};

const EXPIRATION_DATE_IN_SECONDS = 60 * 60 * 24 * 30;

const genericSessionError = new NotFoundError(
  "Sessão não encontrada.",
  "Verifique se você está realmente logado e se a sessão existe.",
);

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

async function findValidByToken(token?: string) {
  if (!token) throw genericSessionError;
  const sessionRow = await database.sql`
    SELECT * FROM sessions
    WHERE token = ${token};
  `;
  if (!sessionRow.rowCount) throw genericSessionError;
  let validSession: PublicSession | undefined;
  for (const session of sessionRow.rows) {
    if (new Date(session.expires_at) > new Date() && !validSession) {
      validSession = session;
      continue;
    }
    await remove(session.token);
  }
  if (!validSession) throw genericSessionError;
  return validSession;
}

async function remove(sessionId?: string) {
  if (!sessionId) throw genericSessionError;
  const sessionRow = await database.sql`
    DELETE FROM sessions
    WHERE token = ${sessionId};
  `;
  if (!sessionRow.rowCount) throw genericSessionError;
}

function addExpirationDate(date: Date) {
  date.setSeconds(date.getSeconds() + EXPIRATION_DATE_IN_SECONDS);
  return date;
}

export default {
  create,
  remove,
  findValidByToken,
  addExpirationDate,
  EXPIRATION_DATE_IN_SECONDS,
};
