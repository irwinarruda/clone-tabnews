import {
  Client,
  type QueryConfigValues,
  type QueryResult,
  type QueryResultRow,
} from "pg";
import { serverEnv } from "~/config/server-env";

function parseTemplate(templateString: TemplateStringsArray) {
  return templateString.reduce(
    (acc, curr, i) =>
      acc + curr + (i !== templateString.length - 1 ? `$${i + 1}` : ""),
    "",
  );
}

async function sql<R extends QueryResultRow = any, I = any[]>(
  templateString: TemplateStringsArray,
  ...values: QueryConfigValues<I>
): Promise<QueryResult<R>> {
  const client = new Client({
    port: serverEnv.PgPort,
    host: serverEnv.PgHost,
    user: serverEnv.PgUser,
    database: serverEnv.PgDatabase,
    password: serverEnv.PgPassword,
    ssl: serverEnv.PgSSL,
  });
  try {
    await client.connect();
    const result = await client.query(parseTemplate(templateString), values);
    return result;
  } finally {
    await client.end();
  }
}

export default {
  sql,
};
