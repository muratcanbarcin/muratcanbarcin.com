const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "src/lib/requestGuard.ts"), "utf8");
const guard = {};
vm.runInNewContext(ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, { exports: guard, URL, TextDecoder, Uint8Array });

function request(headers = {}, body = '{"message":"hello"}') {
  return new Request("https://portfolio.example/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body,
  });
}

test("origin guard rejects foreign, opaque and malformed origins even without fetch metadata", () => {
  for (const origin of ["https://attacker.example", "null", "not-an-origin", "http://portfolio.example", "https://portfolio.example.attacker.example", "https://portfolio.example/"]) {
    assert.equal(guard.isCrossSiteBrowserRequest(request({ origin })), true, origin);
  }
  for (const site of ["cross-site", "same-site", "unexpected"]) {
    assert.equal(guard.isCrossSiteBrowserRequest(request({ "sec-fetch-site": site })), true);
  }
  assert.equal(guard.isCrossSiteBrowserRequest(request({ origin: "https://attacker.example", "sec-fetch-site": "same-origin" })), true);
});

test("same-origin and metadata-free clients remain supported", async () => {
  for (const headers of [{}, { origin: "https://portfolio.example" }, { "sec-fetch-site": "same-origin" }, { "sec-fetch-site": "none" }]) {
    const result = await guard.readSameOriginJson(request(headers), 1024);
    assert.equal(result.ok, true);
    assert.equal(result.value.message, "hello");
  }
});

test("JSON ingestion retains media, syntax and declared/streamed size limits", async () => {
  for (const [req, limit, status] of [
    [request({ origin: "https://attacker.example" }), 1024, 403],
    [request({ "content-type": "text/plain" }), 1024, 415],
    [request({}, "{"), 1024, 400],
    [request({ "content-length": "invalid" }), 1024, 400],
    [request({ "content-length": "2048" }), 1024, 413],
    [request({}, JSON.stringify({ text: "x".repeat(2048) })), 1024, 413],
    [request({}, JSON.stringify({ text: "ş".repeat(600) })), 1024, 413],
  ]) {
    const result = await guard.readSameOriginJson(req, limit);
    assert.equal(result.ok, false);
    assert.equal(result.status, status);
  }
});

const workflow = fs.readFileSync(path.join(root, ".github/workflows/supabase-keepalive.yml"), "utf8");
const script = workflow.match(/node --input-type=module <<'JS'\n([\s\S]*?)\n\s+JS\s*$/)?.[1];
assert.ok(script, "keep-alive script must be present");

async function runKeepAlive(env, upstream = async () => ({})) {
  const calls = [];
  const output = [];
  await vm.runInNewContext(`(async () => { ${script} })()`, {
    process: { env, exit() { throw new Error("exit"); } },
    URL,
    AbortSignal,
    fetch: async (...args) => { calls.push(args); return upstream(...args); },
    console: new Proxy({}, { get: () => (...args) => output.push(args) }),
  });
  assert.equal(output.length, 0, "keep-alive must remain silent");
  return calls;
}

test("keep-alive performs one bounded authenticated read and discards the body", async () => {
  let cancelled = false;
  const calls = await runKeepAlive({ SUPABASE_URL: "https://project-ref.supabase.co", SUPABASE_KEY: "test-only-key" }, async () => ({
    body: { async cancel() { cancelled = true; } },
  }));
  assert.equal(calls.length, 1);
  const [endpoint, options] = calls[0];
  assert.equal(endpoint.href, "https://project-ref.supabase.co/rest/v1/system_logs?select=id&limit=1");
  assert.equal(options.method, "GET");
  assert.equal(options.redirect, "error");
  assert.equal(options.headers.apikey, "test-only-key");
  assert.equal(options.headers.Authorization, "Bearer test-only-key");
  assert.ok(options.signal);
  assert.equal(cancelled, true);
});

test("keep-alive never sends credentials to invalid or foreign destinations", async () => {
  for (const url of [undefined, "not-a-url", "http://project.supabase.co", "https://attacker.example", "https://supabase.co.attacker.example", "https://user:pass@project.supabase.co", "https://project.supabase.co:8443"]) {
    assert.equal((await runKeepAlive({ SUPABASE_URL: url, SUPABASE_KEY: "test-only-key" })).length, 0);
  }
  assert.equal((await runKeepAlive({ SUPABASE_URL: "https://project.supabase.co" })).length, 0);
});

test("keep-alive network, HTTP and cancellation failures are silent", async () => {
  const env = { SUPABASE_URL: "https://project.supabase.co", SUPABASE_KEY: "test-only-key" };
  for (const upstream of [
    async () => { throw new Error("network failure"); },
    async () => ({ status: 401, body: null }),
    async () => ({ status: 503, body: { async cancel() { throw new Error("cancel failure"); } } }),
  ]) assert.equal((await runKeepAlive(env, upstream)).length, 1);
});

test("four-day cron has no month-boundary gap over four days", () => {
  assert.match(workflow, /cron: '17 12 \*\/4 \* \*'/);
  const runs = [];
  for (let day = Date.UTC(2024, 0, 1); day < Date.UTC(2029, 0, 1); day += 86_400_000) {
    if ((new Date(day).getUTCDate() - 1) % 4 === 0) runs.push(day);
  }
  for (let i = 1; i < runs.length; i++) assert.ok(runs[i] - runs[i - 1] <= 4 * 86_400_000);
});
