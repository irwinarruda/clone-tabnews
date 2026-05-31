import crypto from "crypto";
import database from "~/infra/database";
import { UnauthorizedError } from "~/infra/errors";

export type PublicSession = {
  id: string;
  token: string;
  user_id: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
};

const EXPIRATION_DATE_IN_SECONDS = 60 * 60 * 24 * 30;

const unauthorizedSessionError = new UnauthorizedError(
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
  if (!token) throw unauthorizedSessionError;
  const sessionRow = await database.sql`
    SELECT * FROM sessions
    WHERE token = ${token}
    LIMIT 1;
  `;
  if (!sessionRow.rowCount) throw unauthorizedSessionError;
  const foundSession = sessionRow.rows[0] as PublicSession;
  if (new Date(foundSession.expires_at) <= new Date()) {
    await deleteByToken(foundSession.token);
    throw unauthorizedSessionError;
  }
  return foundSession;
}

async function renew(sessionId: string) {
  const date = addExpirationDate(new Date());
  const sessionRow = await database.sql`
    UPDATE sessions
    SET
      expires_at = ${date},
      updated_at = timezone('utc', now())
    WHERE id = ${sessionId}
    RETURNING *;
  `;
  if (!sessionRow.rowCount) throw unauthorizedSessionError;
  return sessionRow.rows[0] as PublicSession;
}

async function remove(sessionId?: string) {
  if (!sessionId) throw unauthorizedSessionError;
  const sessionRow = await database.sql`
    DELETE FROM sessions
    WHERE token = ${sessionId}
    RETURNING *;
  `;
  if (!sessionRow.rowCount) throw unauthorizedSessionError;
  const removedSession = sessionRow.rows[0] as PublicSession;
  if (new Date(removedSession.expires_at) <= new Date()) {
    throw unauthorizedSessionError;
  }
}

async function deleteByToken(token: string) {
  await database.sql`
    DELETE FROM sessions
    WHERE token = ${token};
  `;
}

function addExpirationDate(date: Date) {
  date.setSeconds(date.getSeconds() + EXPIRATION_DATE_IN_SECONDS);
  return date;
}

export default {
  create,
  remove,
  renew,
  findValidByToken,
  addExpirationDate,
  EXPIRATION_DATE_IN_SECONDS,
};
