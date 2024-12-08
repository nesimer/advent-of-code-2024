import { loadFile } from '../tools.ts';

type Point = { x: number; y: number };
type WithinBoundsChecker = (point: Point) => boolean;
/**
 * Apply specific rules to identifiate if a antinodes from 
 * current position and specific point can be add to set of antinodes
 * 
 * @param position - current position coords
 * @param point - coords of point to comparate
 * @param antinodes - set of unique antinodes
 * @param boundChecker - closure to check if a point within bounds of grid
 */
type AntinodeRulesClosure = (position: Point, point: Point, antinodes: Set<string>, boundChecker: WithinBoundsChecker) => void

/**
 * Computes the number of unique antinodes in a grid based on antenna placements and their frequencies.
 * 
 * An antinode is defined by the antinodeRulesToAdd function passed
 * 
 * @param data - A string representation of the grid
 * @param antinodeRulesToAdd - closure to specify rules validation for adding antinode to set
 * @returns The total number of unique antinodes found in the grid.
 */
function countDistinctAntinodes(data: string, antinodeRulesToAdd: AntinodeRulesClosure): number {
  const grid = data.split('\n').map(l => l.split(''));

  const antinodes = new Set<string>();
  const antennasByFrequency = new Map<string, string[]>();

  /**
   * Check if point is within bounds of current grid
   * @param p - point to check
   * @returns `true` if within bounds, `false` otherwise
   */
  const isWithinBounds = (p: Point) => (p.x >= 0 && p.y >= 0 && p.x < grid.length && p.y < grid[0].length)

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const frequency = grid[row][col];
      if (frequency === '.') {
        continue;
      }

      const position = `${row},${col}`;

      if (!antennasByFrequency.has(frequency)) {
        antennasByFrequency.set(frequency, [position]);
        continue;
      }

      const antennas = antennasByFrequency.get(frequency)!;
      for (const node of antennas) {
        const [x, y] = node.split(",").map(Number);
        antinodeRulesToAdd({ x: row, y: col }, { x, y }, antinodes, isWithinBounds)
      }
      antennas.push(position);
    }
  }
  return antinodes.size
}

/**
 * Computes the number of unique antinodes in a grid based on antenna placements and their frequencies.
 * 
 * An antinode is defined as a point perfectly in line with two antennas of the same frequency, 
 * where one antenna is twice as far from the antinode as the other. This method identifies 
 * all such antinodes within the bounds of the grid.
 * 
 * @param data - A string representation of the grid
 * @returns The total number of unique antinodes found in the grid.
 */
function countDistinctAntinodesWithSpecificDistance(data: string): number {
  return countDistinctAntinodes(data, (position, point, antinodes, boundChecker) => {
    const potentialAntinodes = [
      { x: position.x + (position.x - point.x), y: position.y + (position.y - point.y) },
      { x: point.x - (position.x - point.x), y: point.y - (position.y - point.y) },
    ];
    potentialAntinodes.forEach(p => {
      if (boundChecker(p)) {
        antinodes.add(`${p.x},${p.y}`);
      }
    })
  });
}

/**
 * Calculates the number of unique grid positions that are antinodes.
 * 
 * In this model, an antinode is any grid position perfectly in line 
 * with at least two antennas of the same frequency. 
 * Each antenna itself is also considered an antinode. 
 * Antinodes are calculated in both directions along the line formed by two antennas of the same frequency.
 * 
 * @param data - A string representation of the grid
 * @returns The total number of unique antinodes found in the grid.
*/
function countDistinctAntinodesWithAntennaAsAntinode(data: string): number {
  return countDistinctAntinodes(data, (position, point, antinodes, boundChecker) => {
    let antinode: Point = { ...position };
    while (boundChecker(antinode)) {
      antinodes.add(`${antinode.x},${antinode.y}`);
      antinode.x += (position.x - point.x);
      antinode.y += (position.y - point.y);
    }
    antinode = { ...point };
    while (boundChecker(antinode)) {
      antinodes.add(`${antinode.x},${antinode.y}`);
      antinode.x -= (position.x - point.x);
      antinode.y -= (position.y - point.y);
    }
  })
}

export default async function main() {
  const data = await loadFile(8);
  console.log(`Total of distinct antinodes with specific rule validation: ${countDistinctAntinodesWithSpecificDistance(data)}`);
  console.log(`Total of all distinct antinodes with antenna as antinode: ${countDistinctAntinodesWithAntennaAsAntinode(data)}`);
  console.log("⭐⭐");
}