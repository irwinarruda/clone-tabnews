describe("post /api/v1/status", () => {
  describe("Anonymous user", () => {
    let response: Response;
    let body: any;
    beforeAll(async () => {
      response = await fetch("http://localhost:3000/api/v1/status", {
        method: "POST",
      });
      body = await response.json();
    });
    test("Posting status must never work", async () => {
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
