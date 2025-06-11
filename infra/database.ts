import {
  Client,
  type QueryConfigValues,
  type QueryResult,
  type QueryResultRow,
} from "pg";
import { serverEnv } from "~/config/server-env";
import { ServiceError } from "./errors";

async function sql<R extends QueryResultRow = any, I = any[]>(
  templateString: TemplateStringsArray,
  ...values: QueryConfigValues<I>
): Promise<QueryResult<R>> {
  const client = await getClient();
  try {
    const result = await client.query(parseTemplate(templateString), values);
    return result;
  } finally {
    await client.end();
  }
}

async function getClient() {
  try {
    const client = new Client({
      port: serverEnv.PgPort,
      host: serverEnv.PgHost,
      user: serverEnv.PgUser,
      database: serverEnv.PgDatabase,
      password: serverEnv.PgPassword,
      ssl: serverEnv.PgSSL,
    });
    await client.connect();
    return client;
  } catch (err) {
    throw new ServiceError(
      err as Error,
      "Erro na conexão com o banco ou na query.",
    );
  }
}

function parseTemplate(templateString: TemplateStringsArray) {
  return templateString.reduce(
    (acc, curr, i) =>
      acc + curr + (i !== templateString.length - 1 ? `$${i + 1}` : ""),
    "",
  );
}

export default {
  sql,
  getClient,
};
