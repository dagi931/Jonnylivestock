import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 10 },
    { duration: '30s', target: 25 },
    { duration: '1m', target: 25 },
    { duration: '30s', target: 50 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
};

export default function () {
  // 1. Browse all animals
  const resAnimals = http.get('http://localhost:5000/api/animals');
  check(resAnimals, {
    'GET /api/animals status 200': (r) => r.status === 200,
  });

  // 2. View specific animal details
  const resAnimal = http.get('http://localhost:5000/api/animals/cw-001');
  check(resAnimal, {
    'GET /api/animals/cw-001 status 200': (r) => r.status === 200,
  });

  // 3. Browse packages
  const resPackages = http.get('http://localhost:5000/api/packages');
  check(resPackages, {
    'GET /api/packages status 200': (r) => r.status === 200,
  });

  sleep(1);
}
