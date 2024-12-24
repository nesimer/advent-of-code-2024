import { loadFile } from "../tools.ts";

type Change = {
  changes: number[];
  positions: Map<number, number>;
  prices: Map<number, number>;
};

/**
 * Parses the input data into an array of numbers.
 * @param data - The input data as a string.
 * @returns An array of numbers parsed from the input.
 */
function parse(data: string): number[] {
  return data.trim().split("\n").map(Number);
}

/**
 * Performs a bitwise XOR operation treating numbers as unsigned 32-bit integers.
 * @param secret - The first number.
 * @param value - The second number.
 * @returns The XOR result.
 */
function mix(secret: number, value: number): number {
  return (secret & 0xFFFFFFFF) ^ (value & 0xFFFFFFFF);
}

/**
 * Reduces a number to the range [0, 16777216).
 * @param secret - The input number.
 * @returns The pruned number.
 */
function prune(secret: number): number {
  return ((secret % 16777216) + 16777216) % 16777216;
}

/**
 * Multiplies a number by another, applies a mix, and prunes the result.
 * @param secret - The base number.
 * @param by - The multiplier.
 * @returns The transformed number.
 */
function multiply(secret: number, by: number): number {
  return prune(mix(secret, secret * by));
}

/**
 * Divides a number by another, applies a mix, and prunes the result.
 * @param secret - The base number.
 * @param by - The divisor.
 * @returns The transformed number.
 */
function divide(secret: number, by: number): number {
  return prune(mix(secret, Math.floor(secret / by)));
}

/**
 * Generates the next secret number based on the current one.
 * @param secret - The current secret number.
 * @returns The next secret number.
 */
function generateNextSecret(secret: number): number {
  return multiply(divide(multiply(secret, 64), 32), 2048);
}

/**
 * Computes the sum of secret numbers after a given number of iterations.
 * @param data - The input data as a string.
 * @param maxIteration - The number of iterations.
 * @returns The total sum of secrets.
 */
function sumSecretNumber(data: string, maxIteration: number): number {
  const secrets = parse(data);
  let total = 0;

  for (const secret of secrets) {
    let currentSecret = secret;
    for (let i = 0; i < maxIteration; i++) {
      currentSecret = generateNextSecret(currentSecret);
    }
    total += currentSecret;
  }

  return total;
}

/**
 * Computes the price based on a secret number.
 * @param secret - The secret number.
 * @returns The price.
 */
function getPrice(secret: number): number {
  return secret % 10;
}

/**
 * Generates price changes and corresponding prices for a given secret number.
 * @param secret - The starting secret number.
 * @param count - The number of changes to generate.
 * @returns A tuple containing the prices and their changes.
 */
function generateChanges(secret: number, count: number): [number[], number[]] {
  const prices: number[] = [];
  const changes: number[] = [];

  let currentSecret = secret;
  prices.push(getPrice(currentSecret));

  for (let i = 0; i < count; i++) {
    currentSecret = generateNextSecret(currentSecret);
    const newPrice = getPrice(currentSecret);
    prices.push(newPrice);
    changes.push(newPrice - prices[i]);
  }

  return [prices, changes];
}

/**
 * Computes the maximum quantity of bananas based on sequences of price changes.
 * @param data - The input data as a string.
 * @returns The maximum quantity of bananas.
 */
function computeMaxBananas(data: string): number {
  const secrets = parse(data);

  const allChangesAndPrices = new Map<number, [number[], number[]]>();
  for (const secret of secrets) {
    allChangesAndPrices.set(secret, generateChanges(secret, 2000));
  }

  const sequences = new Map<string, Change>();

  for (const secret of secrets) {
    const [prices, changes] = allChangesAndPrices.get(secret)!;

    for (let i = 0; i < changes.length - 3; i++) {
      const sequence = changes.slice(i, i + 4);
      const key = sequence.join(",");

      if (!sequences.has(key)) {
        sequences.set(key, {
          changes: sequence,
          positions: new Map(),
          prices: new Map(),
        });
      }

      const data = sequences.get(key)!;
      if (!data.positions.has(secret)) {
        data.positions.set(secret, i + 4);
        data.prices.set(secret, prices[i + 4]);
      }
    }
  }

  let maxBananas = 0;

  for (const sequence of sequences.values()) {
    let totalBananas = 0;
    for (const secret of secrets) {
      if (sequence.prices.has(secret)) {
        totalBananas += sequence.prices.get(secret)!;
      }
    }

    if (totalBananas > maxBananas) {
      maxBananas = totalBananas;
    }
  }

  return maxBananas;
}

export default async function main() {
  const data = await loadFile(22);

  console.log(`Secret number generated: ${sumSecretNumber(data, 2000)}`);
  console.log(`Max banana quantity: ${computeMaxBananas(data)}`);

  console.log("⭐⭐");
}
