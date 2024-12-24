import { loadFile } from "../tools.ts";

/**
 * Builds a map of connections between computers based on input data.
 *
 * @param data - A string containing connection data in the format "computerA-computerB" per line.
 * @returns A map where keys are computer names and values are sets of directly connected computers.
 */
function buildConnections(data: string): Map<string, Set<string>> {
  const connections = new Map<string, Set<string>>();

  const lines = data.trim().split("\n").filter((line) => line.length > 0);

  for (const line of lines) {
    const [computerA, computerB] = line.split("-");

    if (!connections.has(computerA)) connections.set(computerA, new Set());
    if (!connections.has(computerB)) connections.set(computerB, new Set());

    connections.get(computerA)!.add(computerB);
    connections.get(computerB)!.add(computerA);
  }

  return connections;
}

/**
 * Identifies all triangular relationships (fully connected triplets) in the network.
 *
 * @param connections - A map of computer connections.
 * @returns A set of strings, each representing a triangle, sorted alphabetically by computer name.
 */
function findTriangles(connections: Map<string, Set<string>>): Set<string> {
  const triangles = new Set<string>();
  const computers = Array.from(connections.keys());

  for (let i = 0; i < computers.length - 2; i++) {
    for (let j = i + 1; j < computers.length - 1; j++) {
      for (let k = j + 1; k < computers.length; k++) {
        const computerA = computers[i];
        const computerB = computers[j];
        const computerC = computers[k];

        if (
          connections.get(computerA)!.has(computerB) &&
          connections.get(computerB)!.has(computerC) &&
          connections.get(computerA)!.has(computerC)
        ) {
          const triangle = [computerA, computerB, computerC].sort().join(",");
          triangles.add(triangle);
        }
      }
    }
  }

  return triangles;
}

/**
 * Counts the number of triangles that include at least one computer whose name starts with 't'.
 *
 * @param connections - A map of computer connections.
 * @returns The number of triangles containing a computer starting with 't'.
 */
function countTrianglesWithT(connections: Map<string, Set<string>>): number {
  let count = 0;

  const triangles = findTriangles(connections);

  for (const triangle of triangles) {
    const computers = triangle.split(",");
    if (computers.some((comp) => comp.startsWith("t"))) {
      count++;
    }
  }

  return count;
}

/**
 * Finds the largest clique (maximally connected subset of computers) in the network.
 *
 * @param connections - A map of computer connections.
 * @returns An array of computer names representing the largest clique, sorted alphabetically.
 */
function bronKerbosch(
  R: Set<string>,
  P: Set<string>,
  X: Set<string>,
  connections: Map<string, Set<string>>,
  cliques: string[],
) {
  if (P.size === 0 && X.size === 0) {
    if (R.size > cliques.length) {
      cliques = Array.from(R);
    }
    return;
  }

  const pivot = Array.from(P).concat(Array.from(X))[0];
  const pivotConnections = connections.get(pivot)!;

  for (const v of Array.from(P)) {
    if (!pivotConnections.has(v)) {
      const vConnections = connections.get(v)!;

      bronKerbosch(
        new Set([...Array.from(R), v]),
        new Set(Array.from(P).filter((n) => vConnections.has(n))),
        new Set(Array.from(X).filter((n) => vConnections.has(n))),
        connections,
        cliques,
      );

      P.delete(v);
      X.add(v);
    }
  }
}

/**
 * Recursive implementation of the Bron–Kerbosch algorithm for finding maximal cliques.
 *
 * @param R - The currently growing clique.
 * @param P - The set of potential candidates to be added to the clique.
 * @param X - The set of nodes already excluded from the clique.
 * @param connections - A map of computer connections.
 * @param cliques - An array to store the largest found clique.
 */
function findLargestClique(connections: Map<string, Set<string>>): string[] {
  const cliques: string[] = [];

  bronKerbosch(
    new Set(),
    new Set(Array.from(connections.keys())),
    new Set(),
    connections,
    cliques,
  );

  return cliques.sort();
}

export default async function main() {
  const data = await loadFile(23);
  const connections = buildConnections(data);

  console.log(`Total triangles with T: ${countTrianglesWithT(connections)}`);
  console.log(`LAN party password: ${findLargestClique(connections).join(",")}`);

  console.log("⭐⭐");
}
