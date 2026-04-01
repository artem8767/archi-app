/** Ідентифікатори фону (зберігаються в User.wallpaperId). Лише поточний пресет. */
export const WALLPAPER_IDS = ["original"] as const;

export type WallpaperId = (typeof WALLPAPER_IDS)[number];

export function isWallpaperId(v: string): v is WallpaperId {
  return (WALLPAPER_IDS as readonly string[]).includes(v);
}

export const WALLPAPER_IDS_FOR_ZOD = WALLPAPER_IDS as unknown as [
  WallpaperId,
  ...WallpaperId[],
];
