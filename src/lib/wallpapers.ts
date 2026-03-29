/** Ідентифікатори фону (зберігаються в User.wallpaperId). */
export const WALLPAPER_IDS = [
  "original",
  "aurora",
  "ember",
  "midnight",
  "sage",
  "copper",
  "dune",
  "fjord",
  "glacier",
  "borealis",
  "forge",
  "obsidian",
  "moss",
  "hearth",
  "storm",
  "wine",
  "slate",
  "lagoon",
  "amethyst",
  "blossom",
  "void",
  "rust",
  "ocean",
  "velvet",
  "sand",
] as const;

export type WallpaperId = (typeof WALLPAPER_IDS)[number];

export function isWallpaperId(v: string): v is WallpaperId {
  return (WALLPAPER_IDS as readonly string[]).includes(v);
}

export const WALLPAPER_IDS_FOR_ZOD = WALLPAPER_IDS as unknown as [
  WallpaperId,
  ...WallpaperId[],
];

/** Ключі перекладів settings.wall* для next-intl */
export const WALLPAPER_MESSAGE_KEYS: Record<WallpaperId, string> =
  Object.fromEntries(
    WALLPAPER_IDS.map((id) => [
      id,
      `wall${id.charAt(0).toUpperCase()}${id.slice(1)}`,
    ])
  ) as Record<WallpaperId, string>;
