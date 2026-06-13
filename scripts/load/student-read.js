import http from "k6/http";
import { check, fail, sleep } from "k6";

const baseUrl = (__ENV.BASE_URL || "http://localhost:3010").replace(/\/$/, "");
const email = __ENV.DEMO_STUDENT_EMAIL;
const password = __ENV.DEMO_STUDENT_PASSWORD;

const readPaths = [
  "/api/student/assignments",
  "/api/student/topics",
  "/api/student/exams",
  "/api/student/mistakes",
  "/api/student/agenda",
  "/api/student/notifications",
];

if (/uyanikkoc\.com|uyanik\.com\.tr/.test(baseUrl) && __ENV.ALLOW_PROD_LOAD !== "true") {
  fail("Refusing to run against production without ALLOW_PROD_LOAD=true.");
}

if (!email || !password) {
  fail("Set DEMO_STUDENT_EMAIL and DEMO_STUDENT_PASSWORD for the student read load test.");
}

export const options = {
  vus: Number(__ENV.VUS || 15),
  duration: __ENV.DURATION || "1m",
  thresholds: {
    http_req_failed: ["rate<0.02"],
    http_req_duration: ["p(95)<2500"],
  },
};

export function setup() {
  const response = http.post(
    `${baseUrl}/api/auth/email`,
    JSON.stringify({ email, password }),
    { headers: { "content-type": "application/json" } },
  );

  if (response.status !== 200 || typeof response.json("accessToken") !== "string") {
    fail("Student login failed during setup.");
  }

  return { accessToken: response.json("accessToken") };
}

export default function ({ accessToken }) {
  const path = readPaths[(__ITER + __VU) % readPaths.length];
  const response = http.get(`${baseUrl}${path}`, {
    headers: { authorization: `Bearer ${accessToken}` },
  });

  check(response, {
    "student read is 200": (res) => res.status === 200,
  });

  sleep(1);
}
