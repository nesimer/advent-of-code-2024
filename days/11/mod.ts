import { loadFile } from '../tools.ts';

/**
 * Increases the value associated with the given key in the map by a specified amount.
 * If the key does not exist, it initializes the value to the specified amount.
 *
 * @param {string} key - The key whose value needs to be increased.
 * @param {number} increaseBy - The amount to increase the value by.
 * @param {Map<string, number>} map - The map where the key-value pair exists.
 */
function increaseAndSet(key: string, increaseBy: number, map: Map<string, number>): void {
  map.set(key, (map.get(key) ?? 0) + increaseBy);
}

/**
 * Processes a map by iterating through its keys and creating a new map based on specific conditions.
 *
 * - If the key is "0", increments the value for key "1" in the new map.
 * - If the key has an even length, splits it into two halves, converts them to numbers, and increments their values in the new map.
 * - Otherwise, multiplies the key by 2024, converts it to a string, and increments its value in the new map.
 *
 * @param {Map<string, number>} map - The input map to process.
 * @returns {Map<string, number>} - The resulting map after processing.
 */
function blink(map: Map<string, number>): Map<string, number> {
  const blinkMap = new Map<string, number>();
  for (const key of map.keys()) {
    const increaseBy = map.get(key) ?? 1;
    if (key === "0") {
      increaseAndSet("1", increaseBy, blinkMap);
    } else if (key.length % 2 === 0) {
      const left = (+key.slice(0, key.length / 2)).toString();
      const right = (+key.slice(key.length / 2, key.length)).toString();
      increaseAndSet(left, increaseBy, blinkMap);
      increaseAndSet(right, increaseBy, blinkMap);
    } else {
      increaseAndSet((+key * 2024).toString(), increaseBy, blinkMap);
    }

  }
  return blinkMap;
}

/**
 * Applies the `blink` function to a map a specified number of times.
 *
 * @param {Map<string, number>} stones - The initial map to process.
 * @param {number} times - The number of times to apply the `blink` function.
 * @returns {Map<string, number>} - The resulting map after processing.
 */
function blinkNTimes(stones: Map<string, number>, times: number): Map<string, number> {
  for (let i = 0; i < times; i++) {
    stones = blink(stones)
  }
  return stones;
}

/**
 * Sums all the values in a given map.
 *
 * @param {Map<string, number>} map - The map whose values need to be summed.
 * @returns {number} - The total sum of all values in the map.
 */
function sumMapValues(map: Map<string, number>): number {
  return map.values().reduce((acc, curr) => acc + curr, 0)
}

export default async function main() {
  const data = new Map<string, number>(
    (await loadFile(11))
      .split(" ")
      .map(i => [i, 1])
  );

  const blink25Times = blinkNTimes(data, 25);
  const blink75Times = blinkNTimes(blink25Times, 50 /* 75 - 25 */);

  console.log(`Blink 25 times: ${sumMapValues(blink25Times)}`);
  console.log(`Blink 75 times: ${sumMapValues(blink75Times)}`);

  console.log("⭐⭐");
}