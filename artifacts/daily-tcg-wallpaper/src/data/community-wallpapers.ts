export interface CommunityItem {
  id: number;
  title: string;
  mood: string;
  style: string;
  author: string;
  imageUrl: string;
}

const P = (seed: string) => `https://picsum.photos/seed/${seed}/1080/1920`;

export const COMMUNITY_WALLPAPERS: CommunityItem[] = [
  { id: 101, title: "Void Between Stars",    mood: "Dark",     style: "Minimal",      author: "kira.px",       imageUrl: P("void1")     },
  { id: 102, title: "Copper Dusk",           mood: "Warm",     style: "Gradient",     author: "solano_art",    imageUrl: P("copper1")   },
  { id: 103, title: "Arctic Signal",         mood: "Cool",     style: "Neon",         author: "frost.drops",   imageUrl: P("arctic1")   },
  { id: 104, title: "Mirrored Basin",        mood: "Moody",    style: "Cinematic",    author: "lev_renders",   imageUrl: P("mirror1")   },
  { id: 105, title: "Golden Hour Haze",      mood: "Warm",     style: "Holographic",  author: "sunframe99",    imageUrl: P("golden1")   },
  { id: 106, title: "Deep Current",          mood: "Cool",     style: "Gradient",     author: "aqua.motive",   imageUrl: P("deep1")     },
  { id: 107, title: "Ember Grid",            mood: "Electric", style: "Neon",         author: "gridlocked_",   imageUrl: P("ember2")    },
  { id: 108, title: "Storm Before Quiet",    mood: "Moody",    style: "Cinematic",    author: "grey.theory",   imageUrl: P("storm2")    },
  { id: 109, title: "Pale Frequency",        mood: "Cool",     style: "Minimal",      author: "waveform.art",  imageUrl: P("pale1")     },
  { id: 110, title: "Rust & Salt",           mood: "Warm",     style: "Gradient",     author: "terravision",   imageUrl: P("rust1")     },
  { id: 111, title: "Prism City",            mood: "Vibrant",  style: "Holographic",  author: "lumix_theory",  imageUrl: P("prism2")    },
  { id: 112, title: "Null Space",            mood: "Dark",     style: "Minimal",      author: "0x_render",     imageUrl: P("null1")     },
  { id: 113, title: "Cascade Protocol",      mood: "Electric", style: "Neon",         author: "ux.cascade",    imageUrl: P("cascade1")  },
  { id: 114, title: "Silk Horizon",          mood: "Warm",     style: "Cinematic",    author: "mirai.cuts",    imageUrl: P("silk1")     },
  { id: 115, title: "Onyx Bloom",            mood: "Dark",     style: "Gradient",     author: "dark.flora",    imageUrl: P("onyx1")     },
  { id: 116, title: "Ion Field",             mood: "Electric", style: "Holographic",  author: "ionwaves",      imageUrl: P("ion1")      },
  { id: 117, title: "Broken Mirror",         mood: "Moody",    style: "Minimal",      author: "shard.theory",  imageUrl: P("broken1")   },
  { id: 118, title: "Sand Circuit",          mood: "Warm",     style: "Neon",         author: "circuit.sand",  imageUrl: P("sand1")     },
  { id: 119, title: "Crystalline Shore",     mood: "Cool",     style: "Holographic",  author: "crystalmoth",   imageUrl: P("crystal1")  },
  { id: 120, title: "Burning Archive",       mood: "Vibrant",  style: "Cinematic",    author: "archiv.burn",   imageUrl: P("burn1")     },
  { id: 121, title: "Lavender Collapse",     mood: "Moody",    style: "Gradient",     author: "soft.collapse", imageUrl: P("lavender1") },
  { id: 122, title: "Painted Static",        mood: "Electric", style: "Holographic",  author: "staticframe",   imageUrl: P("static1")   },
  { id: 123, title: "Dune Sequence",         mood: "Warm",     style: "Minimal",      author: "duneworks",     imageUrl: P("dune1")     },
  { id: 124, title: "Frozen Signal",         mood: "Cool",     style: "Neon",         author: "cryo.signal",   imageUrl: P("frozen1")   },
];
