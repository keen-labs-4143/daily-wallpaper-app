import { db, wallpapersTable } from "@workspace/db";

const WALLPAPERS = [
  { title: "Voidborn Sentinel",  mood: "Dark",     style: "Minimal"     },
  { title: "Celestial Arbiter",  mood: "Cool",     style: "Gradient"    },
  { title: "Neon Revenant",      mood: "Electric", style: "Neon"        },
  { title: "Auric Serpent",      mood: "Warm",     style: "Holographic" },
  { title: "Abyssal Tide",       mood: "Moody",    style: "Cinematic"   },
  { title: "Crimson Oracle",     mood: "Warm",     style: "Gradient"    },
  { title: "Frostbound Wyrm",    mood: "Cool",     style: "Minimal"     },
  { title: "Ember Wraith",       mood: "Warm",     style: "Neon"        },
  { title: "Twilight Specter",   mood: "Moody",    style: "Gradient"    },
  { title: "Stormcaller",        mood: "Dark",     style: "Cinematic"   },
  { title: "Lunar Phantom",      mood: "Cool",     style: "Holographic" },
  { title: "Verdant Titan",      mood: "Vibrant",  style: "Gradient"    },
  { title: "Prism Shard",        mood: "Vibrant",  style: "Holographic" },
  { title: "Iron Colossus",      mood: "Dark",     style: "Minimal"     },
  { title: "Dusk Marauder",      mood: "Moody",    style: "Cinematic"   },
  { title: "Solaris Ascendant",  mood: "Warm",     style: "Gradient"    },
  { title: "Spectral Warden",    mood: "Cool",     style: "Cinematic"   },
  { title: "Sakura Ronin",       mood: "Warm",     style: "Minimal"     },
  { title: "Obsidian Drake",     mood: "Dark",     style: "Gradient"    },
  { title: "Aetherial Bloom",    mood: "Vibrant",  style: "Holographic" },
];

const today = new Date().toISOString().slice(0, 10);

async function seed() {
  // Always replace all wallpapers so metadata stays canonical
  await db.delete(wallpapersTable);

  const rows = WALLPAPERS.map((w) => ({
    title: w.title,
    mood: w.mood,
    style: w.style,
    imageUrl: "gradient://generated",
    releaseDate: today,
  }));

  await db.insert(wallpapersTable).values(rows);
  console.log(`Seeded ${rows.length} wallpapers.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
