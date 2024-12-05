import { parseArgs } from "jsr:@std/cli/parse-args";

const flags = parseArgs(Deno.args, {
  boolean: ["example"],
  string: ["day"],
  alias: { example: "e", day: "d" },
  default: { example: false },
});

const path = `./days/${flags.day}/mod.ts`;

try {
  Deno.env.set("WITH_EXAMPLE", String(flags.example));
  console.log(`Results for day ${flags.day}:`);
  await Deno.lstat(path);
  const challenge = (await import(path)).default;
  challenge && (await challenge());
} catch (err) {
  if (!(err instanceof Deno.errors.NotFound)) {
    throw err;
  }
  console.log(`Day ${flags.day} challenge not implemented yet.`);
}
