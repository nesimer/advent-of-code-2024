const wantedChallenge = Deno.args[0];
const path = `./${wantedChallenge}/main.ts`;

try {
  console.log(`Results for challenge ${wantedChallenge}:`);
  await Deno.lstat(path);
  const challenge = (await import(path)).default;
  challenge && (await challenge());
} catch (err) {
  if (!(err instanceof Deno.errors.NotFound)) {
    throw err;
  }
  console.log(`Challenge ${wantedChallenge} not implemented yet.`);
}
