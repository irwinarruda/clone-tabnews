describe("put /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    let response: Response;
    let body: any;
    beforeAll(async () => {
      response = await fetch("http://localhost:3000/api/v1/migrations", {
        method: "PUT",
      });
      body = await response.json();
    });
    test("Putting status must never work", async () => {
      expect(response.status).toBe(405);
      expect(body).toEqual({
        status_code: 405,
        name: "MethodNotAllowedError",
        action:
          "Verifique se o método HTTP enviado é válido para este endpoint.",
        message: "Método não permitido para este endpoint.",
      });
    });
  });
});
