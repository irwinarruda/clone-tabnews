describe("get /api/v1/status", () => {
  let response: Response;
  let data: any;
  let database: any;
  beforeAll(async () => {
    response = await fetch("http://localhost:3000/api/v1/status");
    data = await response.json();
    database = data.dependencies.database;
  });
  test("should return status 200", async () => {
    expect(response.status).toBe(200);
  });
  test("should return updated_at", async () => {
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    expect(data.updated_at).toBeDefined();
    expect(data.updated_at).toMatch(isoRegex);
    expect(data.updated_at).toBe(new Date(data.updated_at).toISOString());
  });
  test("should return database version", async () => {
    expect(database.version).toBeDefined();
    expect(database.version).toBe(import.meta.env.POSTGRES_VERSION);
  });
  test("should return database max_connections", async () => {
    expect(database.max_connections).toBeDefined();
    expect(database.max_connections).toBeGreaterThan(0);
  });
  test("should return database opened_connections", async () => {
    expect(database.opened_connections).toBeDefined();
    expect(database.opened_connections).toBe(1);
  });
});
