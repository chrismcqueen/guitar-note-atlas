import { readFileSync, writeFileSync } from "node:fs";

const [source, destination] = process.argv.slice(2);
if (!source || !destination) throw new Error("Usage: node scripts/extract-position-data.mjs <notes.json> <output.json>");

const legacy = JSON.parse(readFileSync(source, "utf8"));
const output = Object.fromEntries(
  legacy.degrees.map((degree) => [
    degree.degree_id,
    Object.fromEntries(degree.degree_positions.map((position) => [position.position_id, position.coordinates])),
  ]),
);

writeFileSync(destination, `${JSON.stringify(output)}\n`);
