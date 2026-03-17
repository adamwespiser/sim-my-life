import { spawnSync } from "node:child_process";

const commands = [
  ["npm", ["run", "typecheck"]],
  ["npm", ["run", "lint"]],
  ["npm", ["run", "format:check"]],
  ["npm", ["test"]],
  ["npm", ["run", "build"]],
  ["npm", ["run", "size"]],
  ["node", ["scripts/smoke-demo.mjs"]],
  ["node", ["scripts/measure-default-scenario.mjs"]],
];

for (const [command, args] of commands) {
  console.log(`\n$ ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    shell: process.platform === "win32",
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("\nverify passed");
