import http from "k6/http";
import { check, fail, sleep } from "k6";

const baseUrl = (__ENV.BASE_URL || "http://localhost:3010").replace(/\/$/, "");
const email = __ENV.DEMO_STUDENT_EMAIL;
const password = __ENV.DEMO_STUDENT_PASSWORD;

if (/uyanikkoc\.com|uyanik\.com\.tr/.test(baseUrl) && __ENV.ALLOW_PROD_LOAD !== "true") {
  fail("Refusing to run against production without ALLOW_PROD_LOAD=true.");
}

if (!email || !password) {
  fail("Set DEMO_STUDENT_EMAIL and DEMO_STUDENT_PASSWORD for the login load test.");
}

export const options = {
  vus: Number(__ENV.VUS || 10),
  duration: __ENV.DURATION || "1m",
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1500"],
  },
};

export default function () {
  const response = http.post(
    `${baseUrl}/api/auth/email`,
    JSON.stringify({ email, password }),
    { headers: { "content-type": "application/json" } },
  );

  check(response, {
    "login is 200": (res) => res.status === 200,
    "access token returned": (res) => typeof res.json("accessToken") === "string",
    "student user returned": (res) => res.json("user.role") === "student",
  });

  sleep(1);
}
