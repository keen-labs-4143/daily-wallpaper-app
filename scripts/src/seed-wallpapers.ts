import { db, wallpapersTable } from "@workspace/db";

const P = (seed: string) => `https://picsum.photos/seed/${seed}/1080/1920`;

const WALLPAPERS = [
  { title: "Voidborn Sentinel",  mood: "Dark",     style: "Minimal",      imageUrl: P("dark1"),      locationOrDescription: "Guardian of the collapsed nebula, Outer Rim",       sourceCredit: "(© m.velasquez/Artstation)", sourceName: "Artstation",  artistName: "m.velasquez" },
  { title: "Celestial Arbiter",  mood: "Cool",     style: "Gradient",     imageUrl: P("celestial1"), locationOrDescription: "Judgment hall above the frozen sea, Aurora Reach",  sourceCredit: "(© k.reyes/Artstation)",     sourceName: "Artstation",  artistName: "k.reyes" },
  { title: "Neon Revenant",      mood: "Electric", style: "Neon",         imageUrl: P("neon1"),      locationOrDescription: "Back-alley duel, Lower Kowloon District",           sourceCredit: "(© j.tran/Behance)",         sourceName: "Behance",     artistName: "j.tran" },
  { title: "Auric Serpent",      mood: "Warm",     style: "Holographic",  imageUrl: P("gold1"),      locationOrDescription: "Coiled beneath the sunstone temple, Ashfall Desert", sourceCredit: "(© d.okafor/Artstation)",    sourceName: "Artstation",  artistName: "d.okafor" },
  { title: "Abyssal Tide",       mood: "Moody",    style: "Cinematic",    imageUrl: P("ocean1"),     locationOrDescription: "Rising from the trench, Marrow Deep",               sourceCredit: "(© s.lindqvist/Behance)",    sourceName: "Behance",     artistName: "s.lindqvist" },
  { title: "Crimson Oracle",     mood: "Warm",     style: "Gradient",     imageUrl: P("fire1"),      locationOrDescription: "Prophecy carved in embers, Cinder Sanctum",          sourceCredit: "(© a.moreau/Artstation)",    sourceName: "Artstation",  artistName: "a.moreau" },
  { title: "Frostbound Wyrm",    mood: "Cool",     style: "Minimal",      imageUrl: P("frost1"),     locationOrDescription: "Sealed beneath the glacier, Northreach",             sourceCredit: "(© h.nilsson/Behance)",      sourceName: "Behance",     artistName: "h.nilsson" },
  { title: "Ember Wraith",       mood: "Warm",     style: "Neon",         imageUrl: P("ember1"),     locationOrDescription: "Haunting the forge ruins, Old Blackstone Foundry",   sourceCredit: "(© r.iyer/Artstation)",      sourceName: "Artstation",  artistName: "r.iyer" },
  { title: "Twilight Specter",   mood: "Moody",    style: "Gradient",     imageUrl: P("twilight1"),  locationOrDescription: "Drifting through the fog fields, Hollow Vale",       sourceCredit: "(© c.beaumont/Behance)",     sourceName: "Behance",     artistName: "c.beaumont" },
  { title: "Stormcaller",        mood: "Dark",     style: "Cinematic",    imageUrl: P("storm1"),     locationOrDescription: "Summit ritual atop Thunder Crag",                    sourceCredit: "(© n.park/Artstation)",      sourceName: "Artstation",  artistName: "n.park" },
  { title: "Lunar Phantom",      mood: "Cool",     style: "Holographic",  imageUrl: P("moon1"),      locationOrDescription: "Watching from the crater rim, Silverlight Basin",    sourceCredit: "(© e.fischer/Behance)",      sourceName: "Behance",     artistName: "e.fischer" },
  { title: "Verdant Titan",      mood: "Vibrant",  style: "Gradient",     imageUrl: P("forest1"),    locationOrDescription: "Rooted in the canopy, Emberwood Reserve",            sourceCredit: "(© l.mbeki/Artstation)",     sourceName: "Artstation",  artistName: "l.mbeki" },
  { title: "Prism Shard",        mood: "Vibrant",  style: "Holographic",  imageUrl: P("prism1"),     locationOrDescription: "Fractured light vault, Glasswind Spire",             sourceCredit: "(© t.novak/Behance)",        sourceName: "Behance",     artistName: "t.novak" },
  { title: "Iron Colossus",      mood: "Dark",     style: "Minimal",      imageUrl: P("iron1"),      locationOrDescription: "Standing sentinel over Foundry Row",                 sourceCredit: "(© w.duarte/Artstation)",    sourceName: "Artstation",  artistName: "w.duarte" },
  { title: "Dusk Marauder",      mood: "Moody",    style: "Cinematic",    imageUrl: P("dusk1"),      locationOrDescription: "Raiding the last caravan, Redsand Pass",             sourceCredit: "(© p.abara/Behance)",        sourceName: "Behance",     artistName: "p.abara" },
  { title: "Solaris Ascendant",  mood: "Warm",     style: "Gradient",     imageUrl: P("sun1"),       locationOrDescription: "Rising above the salt flats, Dawnreach",             sourceCredit: "(© y.matsuda/Artstation)",   sourceName: "Artstation",  artistName: "y.matsuda" },
  { title: "Spectral Warden",    mood: "Cool",     style: "Cinematic",    imageUrl: P("mist1"),      locationOrDescription: "Patrolling the mist gate, Greywatch Hollow",         sourceCredit: "(© f.rossi/Behance)",        sourceName: "Behance",     artistName: "f.rossi" },
  { title: "Sakura Ronin",       mood: "Warm",     style: "Minimal",      imageUrl: P("cherry1"),    locationOrDescription: "Duel beneath the blossoms, Kiritsu Garden",          sourceCredit: "(© s.kimura/Artstation)",    sourceName: "Artstation",  artistName: "s.kimura" },
  { title: "Obsidian Drake",     mood: "Dark",     style: "Gradient",     imageUrl: P("obsidian1"),  locationOrDescription: "Nesting in the volcanic caldera, Ashspire",          sourceCredit: "(© b.oyelaran/Behance)",     sourceName: "Behance",     artistName: "b.oyelaran" },
  { title: "Aetherial Bloom",    mood: "Vibrant",  style: "Holographic",  imageUrl: P("bloom1"),     locationOrDescription: "Blooming in the sky gardens, Zephyr Terrace",        sourceCredit: "(© a.laurent/Artstation)",   sourceName: "Artstation",  artistName: "a.laurent" },
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
    locationOrDescription: w.locationOrDescription,
    sourceCredit: w.sourceCredit,
    sourceName: w.sourceName,
    artistName: w.artistName,
  }));

  await db.insert(wallpapersTable).values(rows);
  console.log(`Seeded ${rows.length} wallpapers.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
