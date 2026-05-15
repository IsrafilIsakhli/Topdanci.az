const net = require('node:net');

const checks = [
  {
    name: 'PostgreSQL',
    host: process.env.POSTGRES_HOST ?? '127.0.0.1',
    port: Number(process.env.POSTGRES_PORT ?? 55432),
  },
  {
    name: 'Redis',
    host: process.env.REDIS_HOST ?? '127.0.0.1',
    port: Number(process.env.REDIS_PORT ?? 6379),
  },
];

async function main() {
  const results = await Promise.all(checks.map(checkPort));
  const failed = results.filter((result) => !result.ok);

  for (const result of results) {
    const mark = result.ok ? 'ok' : 'fail';
    console.log(`${mark} ${result.name} ${result.host}:${result.port}`);
  }

  if (failed.length > 0) {
    console.error('Local services are not ready. Start them with: docker compose up -d postgres redis');
    process.exit(1);
  }
}

function checkPort(check) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: check.host, port: check.port });
    const timeout = setTimeout(() => {
      socket.destroy();
      resolve({ ...check, ok: false });
    }, 2000);

    socket.once('connect', () => {
      clearTimeout(timeout);
      socket.end();
      resolve({ ...check, ok: true });
    });
    socket.once('error', () => {
      clearTimeout(timeout);
      resolve({ ...check, ok: false });
    });
  });
}

void main();
