import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  // Ramp-up to 500 virtual users (VUs)
  stages: [
    { duration: '10s', target: 100 }, // Warm-up to 100 users
    { duration: '20s', target: 500 }, // Ramp up to 500 users
    { duration: '1m', target: 500 },  // Sustained load at 500 users
    { duration: '15s', target: 0 },   // Graceful cooldown
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],    // Less than 1% failure rate
    http_req_duration: ['p(95)<1000'], // 95% of requests under 1 second
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:5000';

const GET_ROUTES = [
  '/api/health',
  '/api/settings/business',
  '/api/animals',
  '/api/animals?type=sheep',
  '/api/animals?type=goat',
  '/api/animals?type=cow',
  '/api/animals/CW-004',
  '/api/animals/SH-779',
  '/api/animals/GT-173',
  '/api/packages',
  '/api/delivery/locations',
  '/api/settings/bank-accounts',
  '/api/settings/meat-pricing',
];

export default function () {
  // Pick random realistic route
  const path = GET_ROUTES[Math.floor(Math.random() * GET_ROUTES.length)];
  const res = http.get(`${BASE_URL}${path}`);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 1000ms': (r) => r.timings.duration < 1000,
  });

  // Realistic human think time between clicks (100ms - 300ms)
  sleep(0.1 + Math.random() * 0.2);
}

