import {
  Client,
  type QueryConfigValues,
  type QueryResult,
  type QueryResultRow,
} from "pg";
import { serverEnv } from "~/config/server-env";

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
