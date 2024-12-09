import { loadFile } from "../tools.ts";

/**
 * Parses the disk map data from a string and returns an array of strings representing the disk map.
 *
 * @param {string} data - The input data containing the disk map.
 * @returns {string[]} An array of strings representing the parsed disk map.
 */
function parseDiskMap(data: string): string[] {
  const list = data.split("");
  let parsed: string[] = [];
  let currentID = 0;
  for (let i = 0; i < list.length; i++) {
    const value = +list[i];
    const isEven = i % 2 === 0;
    parsed = [
      ...parsed,
      ...new Array(value).fill(isEven ? currentID.toString() : "."),
    ];
    if (isEven) {
      currentID++;
    }
  }
  return parsed;
}

/**
 * Moves file blocks one at a time from the end of the disk to the leftmost free space block
 * until there are no gaps remaining between file blocks.
 *
 * @param {string[]} diskMap - The initial disk map containing file blocks and free space blocks.
 * @returns {string[]} The final disk map with no gaps between file blocks.
 */
function moveBlocksToLeft(diskMap: string[]): string[] {
  const arrangedDiskMap = [...diskMap];
  for (let i = diskMap.length - 1; i >= 0; i--) {
    if (arrangedDiskMap[i] === ".") {
      continue;
    }
    const firstEmptyIndex = arrangedDiskMap.indexOf(".");
    if (firstEmptyIndex >= 0 && firstEmptyIndex < i) {
      arrangedDiskMap[firstEmptyIndex] = diskMap[i];
      arrangedDiskMap[i!] = ".";
    }
  }
  return arrangedDiskMap;
}

/**
 * Computes the checksum of the disk map by summing the product of each file block's index and its value.
 *
 * @param {string[]} diskMap - The disk map containing file blocks and free space blocks.
 * @returns {number} The computed checksum.
 */
function computeChecksum(diskMap: string[]): number {
  let i = 0;
  let total = 0;
  while (i < diskMap.length) {
    if (diskMap[i] !== ".") {
      total += i * +diskMap[i];
    }
    i++;
  }
  return total;
}

/**
 * Parses the input data, arranges the disk map to remove gaps between file blocks,
 * and computes the checksum of the arranged disk map.
 *
 * @param {string} diskMapData - The input data containing the disk map.
 * @returns {number} The computed checksum of the arranged disk map.
 */
function orderByBlockAndChecksumDiskMap(diskMapData: string): number {
  const diskMap = parseDiskMap(diskMapData);
  const arrangedDiskMap = moveBlocksToLeft(diskMap);
  return computeChecksum(arrangedDiskMap);
}

/**
 * Moves whole files to the leftmost span of free space blocks that could fit the file.
 * Attempts to move each file exactly once in order of decreasing file ID number.
 *
 * @param {string[]} diskMap - The initial disk map containing file blocks and free space blocks.
 * @returns {string[]} The final disk map with no gaps between file blocks.
 */
function moveFilesToLeft(diskMap: string[]): string[] {
  let arrangedDiskMap = [...diskMap];
  const fileIdQuantity = arrangedDiskMap
    .filter((char) => char !== ".")
    .reduce<Map<number, number>>((acc, curr) => {
      acc.set(+curr, (acc.get(+curr) || 0) + 1);
      return acc;
    }, new Map());

  let i = arrangedDiskMap.length - 1;
  while (i >= 0) {
    const char = arrangedDiskMap[i];
    if (char === ".") {
      i--;
      continue;
    }
    const totalToMove = fileIdQuantity.get(+char) ?? 0;
    if (totalToMove > 0) {
      let dotCount = 0;
      for (let j = 0; j < arrangedDiskMap.length; j++) {
        if (j >= i) {
          break;
        }

        if (arrangedDiskMap[j] === ".") {
          dotCount++;
        } else {
          if (dotCount < totalToMove) {
            dotCount = 0;
          } else {
            arrangedDiskMap = [
              ...arrangedDiskMap.slice(0, j - dotCount),
              ...new Array(totalToMove).fill(arrangedDiskMap[i]),
              ...arrangedDiskMap.slice(
                j - dotCount + totalToMove,
                i - totalToMove + 1
              ),
              ...new Array(totalToMove).fill("."),
              ...arrangedDiskMap.slice(i + 1),
            ];
            break;
          }
        }
      }
    }
    i -= totalToMove;
  }

  return arrangedDiskMap;
}

/**
 * Parses the input data, arranges the disk map to remove gaps between file blocks,
 * and computes the checksum of the arranged disk map.
 *
 * @param {string} diskMapData - The input data containing the disk map.
 * @returns {number} The computed checksum of the arranged disk map.
 */
function orderByFileAndChecksumDiskMap(diskMapData: string): number {
  const diskMap = parseDiskMap(diskMapData);
  const arrangedDiskMap = moveFilesToLeft(diskMap);
  return computeChecksum(arrangedDiskMap);
}

export default async function main() {
  const data = await loadFile(9);
  console.log(
    `Checksum of arranged block-to-left disk map: ${orderByBlockAndChecksumDiskMap(
      data
    )}`
  );
  console.log(
    `Checksum of arranged by file-to-left disk map: ${orderByFileAndChecksumDiskMap(
      data
    )}`
  );
  console.log(`⭐⭐`);
}
