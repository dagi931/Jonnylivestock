/**
 * Jonny Livestock - 500 Virtual Users (VU) Scenario-Based Load Test
 *
 * Simulates 500 concurrent virtual shoppers browsing the live store:
 * 1. Health & Business Settings
 * 2. Animal Catalog Browsing (/api/animals)
 * 3. Filtered Search (/api/animals?type=sheep, goat, cow)
 * 4. Specific Animal Inspection (/api/animals/:id)
 * 5. Celebration Packages (/api/packages)
 * 6. Delivery Presets & Zones (/api/delivery/locations)
 * 7. Bank Accounts (/api/settings/bank-accounts)
 * 8. Live Meat-by-Kg Pricing (/api/settings/meat-pricing)
 */

import http from 'node:http';

const BASE_URL = process.env.TARGET_URL || 'http://localhost:5000';
const VIRTUAL_USERS = Number(process.env.VUS || 500);
const TEST_DURATION_SECONDS = Number(process.env.DURATION || 15);

// Keep-Alive HTTP Agent for maximum socket reuse and high-throughput simulation
const agent = new http.Agent({
  keepAlive: true,
  maxSockets: 600,
  timeout: 10000
});

const ROUTES = [
  { name: 'Health Check', path: '/api/health' },
  { name: 'Business Settings', path: '/api/settings/business' },
  { name: 'Browse All Animals', path: '/api/animals' },
  { name: 'Filter: Sheep', path: '/api/animals?type=sheep' },
  { name: 'Filter: Goats', path: '/api/animals?type=goat' },
  { name: 'Filter: Cows', path: '/api/animals?type=cow' },
  { name: 'Animal Details (Cow)', path: '/api/animals/CW-004' },
  { name: 'Animal Details (Sheep)', path: '/api/animals/SH-779' },
  { name: 'Animal Details (Goat)', path: '/api/animals/GT-173' },
  { name: 'Celebration Packages', path: '/api/packages' },
  { name: 'Delivery Locations', path: '/api/delivery/locations' },
  { name: 'Bank Accounts', path: '/api/settings/bank-accounts' },
  { name: 'Meat Pricing', path: '/api/settings/meat-pricing' }
];

// Metrics Collector
const metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  bytesRead: 0,
  byRoute: {},
  allLatencies: [],
  startTime: 0,
  endTime: 0
};

ROUTES.forEach(r => {
  metrics.byRoute[r.name] = {
    requests: 0,
    successes: 0,
    failures: 0,
    latencies: [],
    bytes: 0
  };
});

function fetchEndpoint(urlPath, routeName) {
  return new Promise((resolve) => {
    const start = performance.now();
    const url = new URL(urlPath, BASE_URL);

    const req = http.get(
      url,
      {
        agent,
        headers: {
          'User-Agent': 'JonnyLivestockLoadTest/1.0 (500-VU-Simulation)',
          'Accept': 'application/json, text/plain, */*'
        }
      },
      (res) => {
        let size = 0;
        res.on('data', (chunk) => {
          size += chunk.length;
        });
        res.on('end', () => {
          const latency = performance.now() - start;
          const isSuccess = res.statusCode >= 200 && res.statusCode < 400;

          metrics.totalRequests++;
          metrics.bytesRead += size;
          metrics.allLatencies.push(latency);

          const rMetrics = metrics.byRoute[routeName];
          rMetrics.requests++;
          rMetrics.bytes += size;
          rMetrics.latencies.push(latency);

          if (isSuccess) {
            metrics.successfulRequests++;
            rMetrics.successes++;
          } else {
            metrics.failedRequests++;
            rMetrics.failures++;
          }
          resolve({ ok: isSuccess, statusCode: res.statusCode, latency });
        });
      }
    );

    req.on('error', (err) => {
      const latency = performance.now() - start;
      metrics.totalRequests++;
      metrics.failedRequests++;
      const rMetrics = metrics.byRoute[routeName];
      rMetrics.requests++;
      rMetrics.failures++;
      resolve({ ok: false, error: err.message, latency });
    });

    req.setTimeout(8000, () => {
      req.destroy(new Error('Request Timeout (>8000ms)'));
    });
  });
}

// Single Virtual User Worker Lifecycle
async function runVirtualUserWorker(vuId, stopTime) {
  let sessionIndex = 0;

  while (Date.now() < stopTime) {
    // Pick a realistic action from user journey
    // 60% probability of browsing animals/catalog, 40% other GET pages
    const route = ROUTES[Math.floor(Math.random() * ROUTES.length)];
    await fetchEndpoint(route.path, route.name);

    // Realistic micro-pause (50ms - 200ms) simulating user reading/scrolling
    const pauseMs = 50 + Math.floor(Math.random() * 150);
    await new Promise((r) => setTimeout(r, pauseMs));
    sessionIndex++;
  }
}

function calculatePercentile(arr, p) {
  if (!arr || arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

async function startLoadTest() {
  console.log('================================================================');
  console.log(` 🐑 JONNY LIVESTOCK - 500 CONCURRENT VIRTUAL USERS LOAD TEST `);
  console.log('================================================================');
  console.log(` Target Server:   ${BASE_URL}`);
  console.log(` Virtual Users:   ${VIRTUAL_USERS} concurrent simulated shoppers`);
  console.log(` Duration:        ${TEST_DURATION_SECONDS} seconds`);
  console.log(` Target Endpoints: ${ROUTES.length} primary GET routes`);
  console.log('----------------------------------------------------------------');

  // Verify server reachability first
  try {
    const health = await fetchEndpoint('/api/health', 'Health Check');
    if (!health.ok) {
      console.error(`❌ Target server returned non-OK status: ${health.statusCode}`);
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Target server unreachable:', err.message);
    process.exit(1);
  }

  console.log('✅ Server online & verified. Ramping up 500 concurrent virtual users...\n');

  metrics.startTime = Date.now();
  const stopTime = metrics.startTime + TEST_DURATION_SECONDS * 1000;

  // Launch 500 concurrent workers
  const workers = [];
  for (let i = 1; i <= VIRTUAL_USERS; i++) {
    workers.push(runVirtualUserWorker(i, stopTime));
  }

  // Progress ticker
  const progressTimer = setInterval(() => {
    const elapsed = ((Date.now() - metrics.startTime) / 1000).toFixed(1);
    const rps = (metrics.totalRequests / (elapsed || 1)).toFixed(0);
    process.stdout.write(`\r[${elapsed}s / ${TEST_DURATION_SECONDS}s] Active VUs: ${VIRTUAL_USERS} | Requests: ${metrics.totalRequests.toLocaleString()} | Avg RPS: ${rps} | Errors: ${metrics.failedRequests}`);
  }, 1000);

  await Promise.all(workers);
  clearInterval(progressTimer);
  metrics.endTime = Date.now();

  const totalDuration = ((metrics.endTime - metrics.startTime) / 1000).toFixed(2);
  const avgRps = (metrics.totalRequests / totalDuration).toFixed(1);
  const successPercent = ((metrics.successfulRequests / (metrics.totalRequests || 1)) * 100).toFixed(2);
  const totalMb = (metrics.bytesRead / (1024 * 1024)).toFixed(2);
  const mbPerSec = (totalMb / totalDuration).toFixed(2);

  console.log('\n\n================================================================');
  console.log(' 🏁 LOAD TEST RESULTS SUMMARY (500 Concurrent Virtual Users)');
  console.log('================================================================');
  console.log(` Total Duration:          ${totalDuration} seconds`);
  console.log(` Total Requests Served:   ${metrics.totalRequests.toLocaleString()}`);
  console.log(` Successful Requests:     ${metrics.successfulRequests.toLocaleString()} (${successPercent}%)`);
  console.log(` Failed / Timed Out:      ${metrics.failedRequests} (${(100 - Number(successPercent)).toFixed(2)}%)`);
  console.log(` Average Throughput:      ${avgRps} requests/sec`);
  console.log(` Total Data Transferred:  ${totalMb} MB (${mbPerSec} MB/s)`);
  console.log('----------------------------------------------------------------');
  console.log(' Global Latency Percentiles:');
  console.log(`   • Median (p50):        ${calculatePercentile(metrics.allLatencies, 50).toFixed(1)} ms`);
  console.log(`   • 90th Percentile:     ${calculatePercentile(metrics.allLatencies, 90).toFixed(1)} ms`);
  console.log(`   • 95th Percentile:     ${calculatePercentile(metrics.allLatencies, 95).toFixed(1)} ms`);
  console.log(`   • 99th Percentile:     ${calculatePercentile(metrics.allLatencies, 99).toFixed(1)} ms`);
  console.log(`   • Maximum Latency:     ${Math.max(...(metrics.allLatencies.length ? metrics.allLatencies : [0])).toFixed(1)} ms`);
  console.log('----------------------------------------------------------------');
  console.log(' Per-Route Performance Breakdown:');
  console.log(' Route Name               | Reqs  | Succ% | Avg Latency | p95 Latency | MB Read');
  console.log(' ------------------------ | ----- | ----- | ----------- | ----------- | -------');

  ROUTES.forEach(r => {
    const data = metrics.byRoute[r.name];
    const succRate = data.requests ? ((data.successes / data.requests) * 100).toFixed(1) : '100.0';
    const avgLat = data.latencies.length ? (data.latencies.reduce((a, b) => a + b, 0) / data.latencies.length).toFixed(1) : '0.0';
    const p95 = calculatePercentile(data.latencies, 95).toFixed(1);
    const mb = (data.bytes / (1024 * 1024)).toFixed(2);
    const paddedName = r.name.padEnd(24, ' ');
    const paddedReqs = String(data.requests).padStart(5, ' ');
    const paddedSucc = `${succRate}%`.padStart(5, ' ');
    const paddedAvg = `${avgLat} ms`.padStart(11, ' ');
    const paddedP95 = `${p95} ms`.padStart(11, ' ');
    const paddedMb = `${mb} MB`.padStart(7, ' ');

    console.log(` ${paddedName} | ${paddedReqs} | ${paddedSucc} | ${paddedAvg} | ${paddedP95} | ${paddedMb}`);
  });
  console.log('================================================================\n');

  agent.destroy();
}

startLoadTest().catch(err => {
  console.error('Fatal load test error:', err);
  process.exit(1);
});
