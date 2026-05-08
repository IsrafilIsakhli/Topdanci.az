const { spawnSync } = require("node:child_process");

process.env.DATABASE_URL ||= "postgresql://topdanci:topdanci@localhost:5432/topdanci?schema=public";

const result = spawnSync("prisma", ["validate"], {
  env: process.env,
  shell: process.platform === "win32",
  stdio: "inherit",
});

process.exit(result.status ?? 1);
