import http from "k6/http";
import { check, fail, sleep } from "k6";

const baseUrl = (__ENV.BASE_URL || "http://localhost:3010").replace(/\/$/, "");

if (/uyanikkoc\.com|uyanik\.com\.tr/.test(baseUrl) && __ENV.ALLOW_PROD_LOAD !== "true") {
  fail("Refusing to run against production without ALLOW_PROD_LOAD=true.");
}

export const options = {
  vus: Number(__ENV.VUS || 20),
  duration: __ENV.DURATION || "1m",
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1000"],
  },
};

export default function () {
  const response = http.get(`${baseUrl}/api/health`);

  check(response, {
    "health is 200": (res) => res.status === 200,
    "auth secret is ok": (res) => res.json("authSecret") === "ok",
    "database is ok or skipped": (res) => ["ok", "skipped"].includes(String(res.json("database"))),
  });

  sleep(1);
}
