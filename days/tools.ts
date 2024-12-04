/**
 * Loads the content of a text file for a given day.
 *
 * @param {number} day - The day number corresponding to the file to be loaded.
 * @returns {Promise<string>} A promise that resolves to the content of the file.
 * @throws Will throw an error if the file cannot be read.
 */
export const loadFile = (day: number) => {
  try {
    return Deno.readTextFile(`./days/${day}/input.txt`);
  } catch (e) {
    console.error("Error reading the file:", e);
    throw e;
  }
};
