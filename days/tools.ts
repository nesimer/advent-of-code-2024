/**
 * Loads the content of a text file for a given day.
 *
 * if WITH_EXAMPLE === true, load example.txt instead of input.txt
 *
 * @param {number} day - The day number corresponding to the file to be loaded.
 * @returns {Promise<string>} A promise that resolves to the content of the file.
 * @throws Will throw an error if the file cannot be read.
 */
export const loadFile = (day: number) => {
  try {
    const file = Deno.env.get("WITH_EXAMPLE") === "true" ? "example" : "input";
    return Deno.readTextFile(`./days/${day}/${file}.txt`);
  } catch (e) {
    console.error("Error reading the file:", e);
    throw e;
  }
};
