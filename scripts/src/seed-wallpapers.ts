import { db, wallpapersTable } from "@workspace/db";

const P = (seed: string) => `https://picsum.photos/seed/${seed}/1080/1920`;

const WALLPAPERS = [
  { title: "Voidborn Sentinel",  mood: "Dark",     style: "Minimal",      imageUrl: P("dark1")      },
  { title: "Celestial Arbiter",  mood: "Cool",     style: "Gradient",     imageUrl: P("celestial1") },
  { title: "Neon Revenant",      mood: "Electric", style: "Neon",         imageUrl: P("neon1")      },
  { title: "Auric Serpent",      mood: "Warm",     style: "Holographic",  imageUrl: P("gold1")      },
  { title: "Abyssal Tide",       mood: "Moody",    style: "Cinematic",    imageUrl: P("ocean1")     },
  { title: "Crimson Oracle",     mood: "Warm",     style: "Gradient",     imageUrl: P("fire1")      },
  { title: "Frostbound Wyrm",    mood: "Cool",     style: "Minimal",      imageUrl: P("frost1")     },
  { title: "Ember Wraith",       mood: "Warm",     style: "Neon",         imageUrl: P("ember1")     },
  { title: "Twilight Specter",   mood: "Moody",    style: "Gradient",     imageUrl: P("twilight1")  },
  { title: "Stormcaller",        mood: "Dark",     style: "Cinematic",    imageUrl: P("storm1")     },
  { title: "Lunar Phantom",      mood: "Cool",     style: "Holographic",  imageUrl: P("moon1")      },
  { title: "Verdant Titan",      mood: "Vibrant",  style: "Gradient",     imageUrl: P("forest1")    },
  { title: "Prism Shard",        mood: "Vibrant",  style: "Holographic",  imageUrl: P("prism1")     },
  { title: "Iron Colossus",      mood: "Dark",     style: "Minimal",      imageUrl: P("iron1")      },
  { title: "Dusk Marauder",      mood: "Moody",    style: "Cinematic",    imageUrl: P("dusk1")      },
  { title: "Solaris Ascendant",  mood: "Warm",     style: "Gradient",     imageUrl: P("sun1")       },
  { title: "Spectral Warden",    mood: "Cool",     style: "Cinematic",    imageUrl: P("mist1")      },
  { title: "Sakura Ronin",       mood: "Warm",     style: "Minimal",      imageUrl: P("cherry1")    },
  { title: "Obsidian Drake",     mood: "Dark",     style: "Gradient",     imageUrl: P("obsidian1")  },
  { title: "Aetherial Bloom",    mood: "Vibrant",  style: "Holographic",  imageUrl: P("bloom1")     },
];

const today = new Date().toISOString().slice(0, 10);

// Back-date the first 7 so "This Week" shows 7 distinct days
function releaseDate(index: number): string {
  const d = new Date();
  d.setDate(d.getDate() - index);
  return d.toISOString().slice(0, 10);
}

async function seed() {
  await db.delete(wallpapersTable);

  const rows = WALLPAPERS.map((w, i) => ({
    title: w.title,
    mood: w.mood,
    style: w.style,
    imageUrl: w.imageUrl,
    releaseDate: i < 7 ? releaseDate(i) : today,
  }));

  await db.insert(wallpapersTable).values(rows);
  console.log(`Seeded ${rows.length} wallpapers.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
