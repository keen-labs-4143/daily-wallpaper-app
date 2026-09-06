import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const feedPath = resolve(root, "src/data/wallpapers.json");
const requiredText = [
  "title",
  "description",
  "imagePath",
  "dateAvailable",
  "artist",
  "source",
  "credit",
  "collection",
  "mood",
  "style",
];
const isoDate = /^\d{4}-\d{2}-\d{2}$/;
const imagePathPattern = /^wallpapers\/[a-z0-9][a-z0-9-]*\.(webp|jpg|jpeg|png)$/;

let feed;
try {
  feed = JSON.parse(readFileSync(feedPath, "utf8"));
} catch (error) {
  console.error(`[wallpapers] Could not parse ${feedPath}:`, error);
  process.exit(1);
}

const errors = [];
const ids = new Set();

if (!Array.isArray(feed) || feed.length < 14 || feed.length > 30) {
  errors.push("Feed must contain between 14 and 30 wallpaper records.");
} else {
  feed.forEach((record, index) => {
    const label = `Record ${index + 1}`;
    if (!Number.isInteger(record.id) || record.id < 1) {
      errors.push(`${label}: id must be a positive integer.`);
    } else if (ids.has(record.id)) {
      errors.push(`${label}: duplicate id ${record.id}.`);
    }
    ids.add(record.id);

    for (const key of requiredText) {
      if (typeof record[key] !== "string" || !record[key].trim()) {
        errors.push(`${label}: ${key} must be a non-empty string.`);
      }
    }
    if (!isoDate.test(record.dateAvailable ?? "") ||
        Number.isNaN(new Date(`${record.dateAvailable}T00:00:00Z`).getTime())) {
      errors.push(`${label}: dateAvailable must be a valid YYYY-MM-DD date.`);
    }
    if (record.isPublished !== true && record.isPublished !== false) {
      errors.push(`${label}: isPublished must be a boolean.`);
    }
    if (!imagePathPattern.test(record.imagePath ?? "")) {
      errors.push(`${label}: imagePath must be a safe path under wallpapers/.`);
    } else {
      const imagePath = resolve(root, "public", record.imagePath);
      try {
        if (statSync(imagePath).size === 0) {
          errors.push(`${label}: ${record.imagePath} is empty.`);
        }
      } catch {
        errors.push(`${label}: missing public asset ${record.imagePath}.`);
      }
    }
  });
}

if (errors.length) {
  console.error("[wallpapers] Feed validation failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`[wallpapers] Validated ${feed.length} records and bundled images.`);