import autocannon from 'autocannon';

async function runBenchmark() {
  console.log('🚀 Launching 500 Virtual Connection Load Test on Jonny Livestock GET Routes...');
  console.log('Target: http://localhost:5000');
  console.log('Concurrent Virtual Users (Connections): 500');
  console.log('Duration: 10 seconds\n');

  const instance = autocannon({
    url: 'http://localhost:5000',
    connections: 500,
    duration: 10,
    pipelining: 1,
    requests: [
      { method: 'GET', path: '/api/animals' },
      { method: 'GET', path: '/api/animals?type=sheep' },
      { method: 'GET', path: '/api/animals?type=goat' },
      { method: 'GET', path: '/api/animals?type=cow' },
      { method: 'GET', path: '/api/animals/CW-004' },
      { method: 'GET', path: '/api/animals/SH-779' },
      { method: 'GET', path: '/api/animals/GT-173' },
      { method: 'GET', path: '/api/packages' },
      { method: 'GET', path: '/api/settings/business' },
      { method: 'GET', path: '/api/settings/bank-accounts' },
      { method: 'GET', path: '/api/settings/meat-pricing' },
      { method: 'GET', path: '/api/delivery/locations' },
      { method: 'GET', path: '/api/health' }
    ]
  });

  autocannon.track(instance, { renderProgressBar: true });

  const result = await instance;
  console.log('\n=============================================');
  console.log('📊 LOAD TEST RESULT (500 Concurrent Connections)');
  console.log('=============================================');
  console.log(`Total Requests: ${result.requests.total.toLocaleString()}`);
  console.log(`Duration: ${result.duration}s`);
  console.log(`Avg Requests / Second: ${Math.round(result.requests.average).toLocaleString()} req/s`);
  console.log(`Total Data Transferred: ${(result.throughput.total / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`Avg Throughput: ${(result.throughput.average / (1024 * 1024)).toFixed(2)} MB/s`);
  console.log('---------------------------------------------');
  console.log('Latency Statistics:');
  console.log(`  - 50th percentile (p50): ${result.latency.p50} ms`);
  console.log(`  - 75th percentile (p75): ${result.latency.p75} ms`);
  console.log(`  - 90th percentile (p90): ${result.latency.p90} ms`);
  console.log(`  - 99th percentile (p99): ${result.latency.p99} ms`);
  console.log(`  - Max Latency: ${result.latency.max} ms`);
  console.log('---------------------------------------------');
  console.log('Error Summary:');
  console.log(`  - 1xx / 2xx / 3xx: ${result['2xx'] || 0}`);
  console.log(`  - 4xx (Client error): ${result['4xx'] || 0}`);
  console.log(`  - 5xx (Server error): ${result['5xx'] || 0}`);
  console.log(`  - Non-2xx total: ${result.non2xx || 0}`);
  console.log(`  - Timeouts: ${result.timeouts || 0}`);
  console.log(`  - Connection resets / errors: ${result.errors || 0}`);
  console.log('=============================================\n');
}

runBenchmark().catch(err => {
  console.error('Benchmark failed:', err);
  process.exit(1);
});
