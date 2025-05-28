async function retry<T>(fn: () => Promise<T>, maxRetries = 30) {
  try {
    process.stdout.write(".");
    await new Promise((res) => setTimeout(res, 200));
    await fn();
  } catch {
    if (maxRetries <= 0) throw new Error("Max retries exceeded!");
    return retry(fn, maxRetries - 1);
  }
}

async function waitForWebServer() {
  process.stdout.write("\n🟨 Waiting for webserver");
  async function checkWebServer() {
    const response = await fetch("http://localhost:3000/api/v1/status");
    if (!response.ok) throw new Error();
  }
  await retry(checkWebServer);
  process.stdout.write("\n\n");
}

export default { waitForWebServer };
